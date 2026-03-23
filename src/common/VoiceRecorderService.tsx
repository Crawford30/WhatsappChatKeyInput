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

// import NitroSound from 'react-native-nitro-sound';
// import { Platform } from 'react-native';
// import RNBlobUtil from 'react-native-blob-util';
// import { requestAudioPermission } from '../utils/fileUtils';

// export interface AudioData {
//   uri: string;
//   type: string;
//   name: string;
//   duration: number;
//   size: number;
// }

// export enum RecordingState {
//   IDLE = 'IDLE',
//   RECORDING = 'RECORDING',
//   PAUSED = 'PAUSED',
//   STOPPING = 'STOPPING',
//   ERROR = 'ERROR',
// }

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// /**
//  * Improved Audio Recorder Service with WhatsApp-style features
//  * - Real pause/resume support (with time tracking)
//  * - Better error handling
//  * - Proper state management
//  * - File cleanup
//  */
// class VoiceRecorderService {
//   private static instance: VoiceRecorderService;
//   private recordingPath: string | null = null;
//   private recordingStartTime: number = 0;
//   private pausedTime: number = 0;
//   private totalPausedDuration: number = 0;
//   private recordingState: RecordingState = RecordingState.IDLE;
//   private listeners: Set<(state: RecordingState, time: string) => void> =
//     new Set();
//   private recordingDuration: number = 0;
//   private updateInterval: NodeJS.Timeout | null = null;
//   private isRecorderActive: boolean = false;

//   private constructor() {
//     console.log('[AudioRecorderService] Service initialized');
//   }

//   public static getInstance(): VoiceRecorderService {
//     if (!VoiceRecorderService.instance) {
//       VoiceRecorderService.instance = new VoiceRecorderService();
//     }
//     return VoiceRecorderService.instance;
//   }

//   // ==================== File Management ====================

//   private generateUniqueFileName(): string {
//     const timestamp = new Date().getTime();
//     const randomString = Math.random().toString(36).substring(2, 7);
//     return `voice_message_${timestamp}_${randomString}.m4a`;
//   }

//   private generateRecordingPath(): string {
//     const fileName = this.generateUniqueFileName();
//     const basePath =
//       Platform.OS === 'ios'
//         ? RNBlobUtil.fs.dirs.DocumentDir
//         : RNBlobUtil.fs.dirs.CacheDir;
//     return `${basePath}/${fileName}`;
//   }

//   private async ensureDirectoryExists(filePath: string): Promise<void> {
//     try {
//       const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
//       const exists = await RNBlobUtil.fs.exists(dirPath);
//       if (!exists) {
//         await RNBlobUtil.fs.mkdir(dirPath);
//         console.log(`[AudioRecorderService] Created directory: ${dirPath}`);
//       }
//     } catch (error) {
//       console.warn('[AudioRecorderService] Directory check error:', error);
//     }
//   }

//   // ==================== State Management ====================

//   public subscribe(
//     callback: (state: RecordingState, time: string) => void
//   ): () => void {
//     this.listeners.add(callback);
//     return () => this.listeners.delete(callback);
//   }

//   private setRecordingState(state: RecordingState): void {
//     this.recordingState = state;
//     this.notifyListeners(state, this.getFormattedElapsedTime());
//   }

//   private notifyListeners(state: RecordingState, time: string): void {
//     this.listeners.forEach(callback => callback(state, time));
//   }

//   // ==================== Time Calculation ====================

//   private getElapsedTime(): number {
//     if (this.recordingStartTime === 0) return 0;

//     const now = Date.now();
//     const totalTime = now - this.recordingStartTime;
//     return totalTime - this.totalPausedDuration;
//   }

//   private getFormattedElapsedTime(): string {
//     return this.formatTime(this.getElapsedTime());
//   }

//   private formatTime(milliseconds: number): string {
//     const totalSeconds = Math.floor(milliseconds / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   }

//   private startTimeUpdate(): void {
//     if (this.updateInterval) {
//       clearInterval(this.updateInterval);
//     }

//     this.updateInterval = setInterval(() => {
//       if (this.recordingState === RecordingState.RECORDING) {
//         this.notifyListeners(
//           RecordingState.RECORDING,
//           this.getFormattedElapsedTime()
//         );
//       }
//     }, 100);
//   }

//   private stopTimeUpdate(): void {
//     if (this.updateInterval) {
//       clearInterval(this.updateInterval);
//       this.updateInterval = null;
//     }
//   }

//   // ==================== Recording Operations ====================

//   public async startRecording(): Promise<void> {
//     if (this.recordingState !== RecordingState.IDLE) {
//       throw new Error(`Cannot start. Current state: ${this.recordingState}`);
//     }

//     try {
//       console.log('[AudioRecorderService] Requesting permission...');
//       const permissionGranted = await requestAudioPermission();
//       if (!permissionGranted) {
//         throw new Error('Microphone permission denied');
//       }

//       this.recordingPath = this.generateRecordingPath();
//       console.log(`[AudioRecorderService] Path: ${this.recordingPath}`);

//       await this.ensureDirectoryExists(this.recordingPath);

//       this.recordingStartTime = Date.now();
//       this.totalPausedDuration = 0;
//       this.pausedTime = 0;
//       this.setRecordingState(RecordingState.RECORDING);
//       this.startTimeUpdate();

//       console.log('[AudioRecorderService] Starting NitroSound...');
//       const result = await NitroSound.startRecorder(this.recordingPath);
//       this.isRecorderActive = true;

//       if (!result) {
//         throw new Error('NitroSound returned empty result');
//       }

//       console.log('[AudioRecorderService] ✅ Recording started');
//     } catch (error) {
//       console.error('[AudioRecorderService] ❌ Start error:', error);
//       this.setRecordingState(RecordingState.ERROR);
//       await this.resetRecorder();
//       throw error;
//     }
//   }

//   public async pauseRecording(): Promise<void> {
//     if (this.recordingState !== RecordingState.RECORDING) {
//       console.warn(
//         `[AudioRecorderService] Cannot pause. State: ${this.recordingState}`
//       );
//       return;
//     }

//     try {
//       console.log('[AudioRecorderService] Pausing...');
//       this.pausedTime = Date.now();
//       this.setRecordingState(RecordingState.PAUSED);
//       this.stopTimeUpdate();
//       console.log('[AudioRecorderService] ⏸ Paused');
//     } catch (error) {
//       console.error('[AudioRecorderService] Pause error:', error);
//       throw error;
//     }
//   }

//   public async resumeRecording(): Promise<void> {
//     if (this.recordingState !== RecordingState.PAUSED) {
//       console.warn(
//         `[AudioRecorderService] Cannot resume. State: ${this.recordingState}`
//       );
//       return;
//     }

//     try {
//       console.log('[AudioRecorderService] Resuming...');
//       this.totalPausedDuration += Date.now() - this.pausedTime;
//       this.setRecordingState(RecordingState.RECORDING);
//       this.startTimeUpdate();
//       console.log('[AudioRecorderService] ▶ Resumed');
//     } catch (error) {
//       console.error('[AudioRecorderService] Resume error:', error);
//       throw error;
//     }
//   }

//   public async stopRecording(): Promise<AudioData | null> {
//     if (
//       this.recordingState !== RecordingState.RECORDING &&
//       this.recordingState !== RecordingState.PAUSED
//     ) {
//       console.warn(
//         `[AudioRecorderService] Cannot stop. State: ${this.recordingState}`
//       );
//       return null;
//     }

//     try {
//       console.log('[AudioRecorderService] Stopping...');

//       const durationMs = this.getElapsedTime();
//       const durationSec = Math.floor(durationMs / 1000);

//       // Minimum duration check (500ms)
//       if (durationMs < 500) {
//         console.log('[AudioRecorderService] Too short, cancelling');
//         await this.resetRecorder();
//         return null;
//       }

//       this.recordingDuration = durationMs;
//       this.setRecordingState(RecordingState.STOPPING);
//       this.stopTimeUpdate();

//       let result: string | null = null;

//       if (this.isRecorderActive) {
//         result = await NitroSound.stopRecorder();
//         this.isRecorderActive = false;
//       } else {
//         result = this.recordingPath;
//       }

//       if (!result) {
//         console.error('[AudioRecorderService] No result from stopRecorder');
//         await this.resetRecorder();
//         return null;
//       }

//       // Wait for file write
//       await delay(500);

//       let filePath = result.startsWith('file://')
//         ? result.substring(7)
//         : result;

//       // Verify file
//       let fileExists = await RNBlobUtil.fs.exists(filePath);

//       if (!fileExists && this.recordingPath) {
//         fileExists = await RNBlobUtil.fs.exists(this.recordingPath);
//         if (fileExists) filePath = this.recordingPath;
//       }

//       if (!fileExists) {
//         throw new Error('Recording file not found');
//       }

//       const fileStats = await RNBlobUtil.fs.stat(filePath);
//       if (fileStats.size === 0) {
//         throw new Error('Recording file is empty');
//       }

//       const audioData: AudioData = {
//         uri: `file://${filePath}`,
//         type: 'audio/mp4',
//         name: filePath.split('/').pop() || this.generateUniqueFileName(),
//         duration: durationSec,
//         size: fileStats.size,
//       };

//       await this.resetRecorder();
//       console.log('[AudioRecorderService] ✅ Completed:', audioData);
//       return audioData;
//     } catch (error) {
//       console.error('[AudioRecorderService] ❌ Stop error:', error);
//       this.setRecordingState(RecordingState.ERROR);
//       await this.resetRecorder();
//       return null;
//     }
//   }

//   public async cancelRecording(): Promise<void> {
//     if (
//       this.recordingState !== RecordingState.RECORDING &&
//       this.recordingState !== RecordingState.PAUSED
//     ) {
//       console.warn(
//         `[AudioRecorderService] Cannot cancel. State: ${this.recordingState}`
//       );
//       return;
//     }

//     try {
//       console.log('[AudioRecorderService] Cancelling...');

//       if (this.isRecorderActive) {
//         await NitroSound.stopRecorder();
//         this.isRecorderActive = false;
//       }

//       if (this.recordingPath) {
//         try {
//           const exists = await RNBlobUtil.fs.exists(this.recordingPath);
//           if (exists) {
//             await RNBlobUtil.fs.unlink(this.recordingPath);
//             console.log('[AudioRecorderService] File deleted');
//           }
//         } catch (deleteError) {
//           console.warn('[AudioRecorderService] Delete error:', deleteError);
//         }
//       }

//       await this.resetRecorder();
//       console.log('[AudioRecorderService] 🗑️ Cancelled');
//     } catch (error) {
//       console.error('[AudioRecorderService] Cancel error:', error);
//       await this.resetRecorder();
//     }
//   }

//   private async resetRecorder(): Promise<void> {
//     try {
//       this.stopTimeUpdate();

//       if (this.isRecorderActive) {
//         try {
//           await NitroSound.stopRecorder();
//         } catch (error) {
//           console.warn('[AudioRecorderService] Stop during reset:', error);
//         }
//         this.isRecorderActive = false;
//       }

//       this.setRecordingState(RecordingState.IDLE);
//       this.recordingPath = null;
//       this.recordingStartTime = 0;
//       this.recordingDuration = 0;
//       this.pausedTime = 0;
//       this.totalPausedDuration = 0;
//       console.log('[AudioRecorderService] 🔄 Reset to IDLE');
//     } catch (error) {
//       console.error('[AudioRecorderService] Reset error:', error);
//       this.recordingState = RecordingState.IDLE;
//       this.isRecorderActive = false;
//     }
//   }

//   // ==================== Public Getters ====================

//   public getRecordingState(): RecordingState {
//     return this.recordingState;
//   }

//   public getRecordingDuration(): number {
//     return this.getElapsedTime();
//   }

//   public getFormattedDuration(): string {
//     return this.formatTime(this.getElapsedTime());
//   }

//   public isCurrentlyRecording(): boolean {
//     return (
//       this.recordingState === RecordingState.RECORDING ||
//       this.recordingState === RecordingState.PAUSED
//     );
//   }
// }

// export default VoiceRecorderService;
