import { Platform } from 'react-native';
import { RecordingState, AudioData } from '../types/inputTypes';
import { requestAudioPermission } from '../utils/fileUtils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * VoiceRecorderService - singleton that wraps react-native-nitro-sound
 * with WhatsApp-style state management: pause/resume tracking, min/max
 * duration enforcement, and proper file lifecycle management.
 */
class VoiceRecorderService {
  private static instance: VoiceRecorderService;

  private recordingPath: string | null = null;
  private recordingStartTime = 0;
  private pausedAt = 0;
  private totalPausedMs = 0;
  private state: RecordingState = RecordingState.IDLE;
  private isActive = false;
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(state: RecordingState, time: string) => void>();

  private constructor() {}

  static getInstance(): VoiceRecorderService {
    if (!VoiceRecorderService.instance) {
      VoiceRecorderService.instance = new VoiceRecorderService();
    }
    return VoiceRecorderService.instance;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private generatePath(): string {
    const ts = Date.now();
    const rnd = Math.random().toString(36).slice(2, 7);
    const name = `voice_${ts}_${rnd}.m4a`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RNBlobUtil = require('react-native-blob-util').default;
      const base =
        Platform.OS === 'ios'
          ? RNBlobUtil.fs.dirs.DocumentDir
          : RNBlobUtil.fs.dirs.CacheDir;
      return `${base}/${name}`;
    } catch {
      return name;
    }
  }

  private elapsedMs(): number {
    if (!this.recordingStartTime) return 0;
    return Date.now() - this.recordingStartTime - this.totalPausedMs;
  }

  private formatTime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  private setState(s: RecordingState) {
    this.state = s;
    this.notify();
  }

  private notify() {
    const time = this.formatTime(this.elapsedMs());
    this.listeners.forEach(cb => cb(this.state, time));
  }

  private startTick() {
    this.stopTick();
    this.updateInterval = setInterval(() => this.notify(), 100);
  }

  private stopTick() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  subscribe(cb: (state: RecordingState, time: string) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  getState(): RecordingState {
    return this.state;
  }
  getElapsedMs(): number {
    return this.elapsedMs();
  }
  getFormattedTime(): string {
    return this.formatTime(this.elapsedMs());
  }
  isRecording(): boolean {
    return (
      this.state === RecordingState.RECORDING ||
      this.state === RecordingState.PAUSED
    );
  }

  async startRecording(): Promise<void> {
    if (this.state !== RecordingState.IDLE) {
      throw new Error(`Cannot start. State: ${this.state}`);
    }

    const granted = await requestAudioPermission();
    if (!granted) throw new Error('Microphone permission denied');

    this.recordingPath = this.generatePath();
    this.recordingStartTime = Date.now();
    this.totalPausedMs = 0;
    this.pausedAt = 0;

    this.setState(RecordingState.RECORDING);
    this.startTick();

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NitroSound = require('react-native-nitro-sound').default;
      const result = await NitroSound.startRecorder(this.recordingPath);
      if (!result) throw new Error('NitroSound.startRecorder returned empty');
      this.isActive = true;
    } catch (err) {
      this.setState(RecordingState.ERROR);
      await this.reset();
      throw err;
    }
  }

  async pauseRecording(): Promise<void> {
    if (this.state !== RecordingState.RECORDING) return;
    this.pausedAt = Date.now();
    this.stopTick();
    this.setState(RecordingState.PAUSED);
  }

  async resumeRecording(): Promise<void> {
    if (this.state !== RecordingState.PAUSED) return;
    this.totalPausedMs += Date.now() - this.pausedAt;
    this.pausedAt = 0;
    this.setState(RecordingState.RECORDING);
    this.startTick();
  }

  async stopRecording(): Promise<AudioData | null> {
    if (
      this.state !== RecordingState.RECORDING &&
      this.state !== RecordingState.PAUSED
    ) {
      return null;
    }

    const durationMs = this.elapsedMs();
    if (durationMs < 500) {
      await this.reset();
      return null;
    }

    this.setState(RecordingState.STOPPING);
    this.stopTick();

    let filePath: string | null = null;

    try {
      if (this.isActive) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NitroSound = require('react-native-nitro-sound').default;
        const result: string = await NitroSound.stopRecorder();
        this.isActive = false;
        filePath = result?.startsWith('file://') ? result.slice(7) : result;
      } else {
        filePath = this.recordingPath;
      }

      if (!filePath) throw new Error('No file path after stop');

      // Give the OS a moment to flush
      await delay(400);

      let size = 0;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RNBlobUtil = require('react-native-blob-util').default;
        const exists = await RNBlobUtil.fs.exists(filePath);
        if (!exists && this.recordingPath) {
          const alt = await RNBlobUtil.fs.exists(this.recordingPath);
          if (alt) filePath = this.recordingPath;
        }
        const stats = await RNBlobUtil.fs.stat(filePath);
        size = stats.size;
        if (size === 0) throw new Error('Recording file is empty');
      } catch {
        // If blob util not available, proceed without size check
        size = -1;
      }

      const audioData: AudioData = {
        uri: `file://${filePath}`,
        type: 'audio/mp4',
        name: filePath.split('/').pop() || `voice_${Date.now()}.m4a`,
        duration: Math.floor(durationMs / 1000),
        size,
      };

      await this.reset();
      return audioData;
    } catch (err) {
      console.error('[VoiceRecorderService] stopRecording error:', err);
      this.setState(RecordingState.ERROR);
      await this.reset();
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    if (!this.isRecording()) return;

    try {
      if (this.isActive) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NitroSound = require('react-native-nitro-sound').default;
        await NitroSound.stopRecorder();
        this.isActive = false;
      }

      if (this.recordingPath) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const RNBlobUtil = require('react-native-blob-util').default;
          const exists = await RNBlobUtil.fs.exists(this.recordingPath);
          if (exists) await RNBlobUtil.fs.unlink(this.recordingPath);
        } catch {
          // ignore cleanup errors
        }
      }
    } catch (err) {
      console.warn('[VoiceRecorderService] cancelRecording error:', err);
    } finally {
      await this.reset();
    }
  }

  private async reset(): Promise<void> {
    this.stopTick();

    if (this.isActive) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NitroSound = require('react-native-nitro-sound').default;
        await NitroSound.stopRecorder();
      } catch {
        /* ignore */
      }
      this.isActive = false;
    }

    this.recordingPath = null;
    this.recordingStartTime = 0;
    this.totalPausedMs = 0;
    this.pausedAt = 0;
    this.setState(RecordingState.IDLE);
  }
}

export default VoiceRecorderService;
