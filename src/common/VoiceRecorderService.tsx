import Sound from 'react-native-nitro-sound';

export enum RecordingState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export interface AudioData {
  uri: string;
  duration: number;
  size: number;
}

type StateChangeCallback = (state: RecordingState, time: string) => void;

class VoiceRecorderService {
  private static instance: VoiceRecorderService;
  private state: RecordingState = RecordingState.IDLE;
  private recordingStartTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<StateChangeCallback> = new Set();
  private currentRecordTime: string = '0:00';
  private recordingPath: string | null = null;

  private constructor() {}

  static getInstance(): VoiceRecorderService {
    if (!VoiceRecorderService.instance) {
      VoiceRecorderService.instance = new VoiceRecorderService();
    }
    return VoiceRecorderService.instance;
  }

  subscribe(callback: StateChangeCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.state, this.currentRecordTime);
    });
  }

  private updateTimer(): void {
    if (this.state === RecordingState.RECORDING) {
      const elapsed =
        Date.now() - this.recordingStartTime - this.pausedDuration;
      this.currentRecordTime = this.formatTime(elapsed);
      this.notifySubscribers();
    }
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async startRecording(): Promise<void> {
    try {
      console.log('[VoiceRecorder] Starting recording');

      if (this.state !== RecordingState.IDLE) {
        console.log('[VoiceRecorder] Already recording or paused');
        return;
      }

      // Start recording using Sound singleton
      const result = await Sound.startRecorder();
      this.recordingPath = result;

      // Initialize timing
      this.recordingStartTime = Date.now();
      this.pausedDuration = 0;
      this.pauseStartTime = 0;
      this.currentRecordTime = '0:00';

      // Update state
      this.state = RecordingState.RECORDING;

      // Start timer
      this.startTimer();

      // Notify subscribers
      this.notifySubscribers();

      console.log('[VoiceRecorder] Recording started:', result);
    } catch (error) {
      console.error('[VoiceRecorder] Failed to start recording:', error);
      this.state = RecordingState.IDLE;
      this.notifySubscribers();
      throw error;
    }
  }

  async pauseRecording(): Promise<void> {
    try {
      console.log('[VoiceRecorder] Pausing recording');

      if (this.state !== RecordingState.RECORDING) {
        console.log('[VoiceRecorder] Not recording');
        return;
      }

      await Sound.pauseRecorder();

      this.pauseStartTime = Date.now();
      this.state = RecordingState.PAUSED;
      this.stopTimer();
      this.notifySubscribers();

      console.log('[VoiceRecorder] Recording paused');
    } catch (error) {
      console.error('[VoiceRecorder] Failed to pause recording:', error);
      throw error;
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      console.log('[VoiceRecorder] Resuming recording');

      if (this.state !== RecordingState.PAUSED) {
        console.log('[VoiceRecorder] Not paused');
        return;
      }

      await Sound.resumeRecorder();

      if (this.pauseStartTime > 0) {
        this.pausedDuration += Date.now() - this.pauseStartTime;
        this.pauseStartTime = 0;
      }

      this.state = RecordingState.RECORDING;
      this.startTimer();
      this.notifySubscribers();

      console.log('[VoiceRecorder] Recording resumed');
    } catch (error) {
      console.error('[VoiceRecorder] Failed to resume recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<AudioData | null> {
    try {
      console.log('[VoiceRecorder] Stopping recording');

      if (
        this.state !== RecordingState.RECORDING &&
        this.state !== RecordingState.PAUSED
      ) {
        console.log('[VoiceRecorder] Not recording');
        return null;
      }

      const result = await Sound.stopRecorder();

      this.stopTimer();

      const duration =
        (Date.now() - this.recordingStartTime - this.pausedDuration) / 1000;

      this.state = RecordingState.STOPPED;
      this.notifySubscribers();

      // Get file stats if needed
      let fileSize = 0;
      try {
        const RNBlobUtil = require('react-native-blob-util');
        const filePath = result.startsWith('file://')
          ? result.substring(7)
          : result;
        const stats = await RNBlobUtil.fs.stat(filePath);
        fileSize = stats.size || 0;
      } catch (error) {
        console.warn('[VoiceRecorder] Could not get file size:', error);
      }

      const audioData: AudioData = {
        uri: result.startsWith('file://') ? result : `file://${result}`,
        duration: Math.round(duration),
        size: fileSize,
      };

      this.cleanup();

      console.log('[VoiceRecorder] Recording stopped:', audioData);

      return audioData;
    } catch (error) {
      console.error('[VoiceRecorder] Failed to stop recording:', error);
      this.cleanup();
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      console.log('[VoiceRecorder] Cancelling recording');

      if (
        this.state === RecordingState.RECORDING ||
        this.state === RecordingState.PAUSED
      ) {
        await Sound.stopRecorder();
      }

      this.cleanup();

      console.log('[VoiceRecorder] Recording cancelled');
    } catch (error) {
      console.error('[VoiceRecorder] Failed to cancel recording:', error);
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.stopTimer();
    this.recordingPath = null;
    this.state = RecordingState.IDLE;
    this.recordingStartTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
    this.currentRecordTime = '0:00';
    this.notifySubscribers();
  }

  getRecordingDuration(): number {
    if (this.state === RecordingState.IDLE) {
      return 0;
    }

    let elapsed = Date.now() - this.recordingStartTime - this.pausedDuration;

    if (this.state === RecordingState.PAUSED && this.pauseStartTime > 0) {
      elapsed =
        this.pauseStartTime - this.recordingStartTime - this.pausedDuration;
    }

    return elapsed;
  }

  getState(): RecordingState {
    return this.state;
  }

  getRecordTime(): string {
    return this.currentRecordTime;
  }
}

export default VoiceRecorderService;
