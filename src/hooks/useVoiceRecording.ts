import { useRef, useState, useCallback, useEffect } from 'react';
import { Keyboard, Platform, PermissionsAndroid } from 'react-native';
import { Sound } from 'react-native-nitro-sound';

interface UseVoiceRecordingOptions {
  onRecordingComplete?: (uri: string, duration: number) => void;
  onError?: (error: Error) => void;
  maxDuration?: number; // seconds
  waveformSampleSize?: number;
}

export const useVoiceRecording = (options: UseVoiceRecordingOptions = {}) => {
  const {
    onRecordingComplete,
    onError,
    maxDuration = 300, // 5 minutes
    waveformSampleSize = 20,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  const recordingRef = useRef<string | null>(null);
  const soundRef = useRef<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingUriRef = useRef<string | null>(null);
  const isNitroInitializedRef = useRef(false);

  // Initialize Nitro Sound
  useEffect(() => {
    const initializeNitro = async () => {
      try {
        // Request microphone permissions
        if (Platform.OS === 'android') {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'App needs access to microphone for voice messages',
              buttonNeutral: 'Ask Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('Microphone permission denied');
          }
        }

        isNitroInitializedRef.current = true;
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error
            : new Error('Failed to initialize audio')
        );
      }
    };

    initializeNitro();

    return () => {
      cleanupTimers();
    };
  }, [onError]);

  const cleanupTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!isNitroInitializedRef.current) {
        throw new Error('Audio module not initialized');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `voice_${timestamp}.m4a`;

      // Start recording using correct API
      const uri = await Sound.startRecorder(filename);

      if (!uri) {
        throw new Error('Failed to start recording');
      }

      recordingRef.current = uri;
      recordingUriRef.current = uri;

      setIsRecording(true);
      setIsLocked(false);
      setIsPaused(false);
      setDuration(0);
      setWaveform([]);

      // Dismiss keyboard
      Keyboard.dismiss();

      // Start timer
      startTimer();

      // Start waveform simulation
      startWaveformSimulation();
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to start recording')
      );
      setIsRecording(false);
    }
  }, [onError]);

  const startTimer = useCallback(() => {
    cleanupTimers();
    timerIntervalRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        // Auto-stop if max duration reached
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  }, [maxDuration]);

  const startWaveformSimulation = useCallback(() => {
    cleanupTimers();
    waveformIntervalRef.current = setInterval(() => {
      setWaveform(prev => [
        ...prev.slice(-waveformSampleSize + 1),
        Math.random() * 100,
      ]);
    }, 100);
  }, [waveformSampleSize]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (!isNitroInitializedRef.current || !recordingRef.current) {
        return null;
      }

      // Stop recording using correct API
      const uri = await Sound.stopRecorder();

      cleanupTimers();
      recordingRef.current = null;
      recordingUriRef.current = uri || null;

      setIsRecording(false);
      setIsLocked(false);

      return uri || null;
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to stop recording')
      );
      return null;
    }
  }, [onError]);

  const pauseRecording = useCallback(async () => {
    try {
      if (!isNitroInitializedRef.current || !isRecording || isPaused) {
        return;
      }

      // Pause recording using correct API
      const success = await Sound.pauseRecorder();

      if (success) {
        cleanupTimers();
        setIsPaused(true);
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to pause recording')
      );
    }
  }, [isRecording, isPaused, onError]);

  const resumeRecording = useCallback(async () => {
    try {
      if (!isNitroInitializedRef.current || !isPaused) {
        return;
      }

      // Resume recording using correct API
      const success = await Sound.resumeRecorder();

      if (success) {
        setIsPaused(false);
        startTimer();
        startWaveformSimulation();
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to resume recording')
      );
    }
  }, [isPaused, onError]);

  const cancelRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        // Stop and discard recording
        await Sound.stopRecorder();
      }
    } catch (error) {
      console.warn('Failed to discard recording:', error);
    }

    const uri = await stopRecording();

    setIsRecording(false);
    setIsLocked(false);
    setIsPaused(false);
    setDuration(0);
    setWaveform([]);
    recordingUriRef.current = null;
  }, [stopRecording]);

  const sendRecording = useCallback(async () => {
    const uri = await stopRecording();

    if (uri && onRecordingComplete) {
      onRecordingComplete(uri, duration);
    }

    setIsRecording(false);
    setIsLocked(false);
    setIsPaused(false);
    setDuration(0);
    setWaveform([]);
    recordingUriRef.current = null;
  }, [stopRecording, duration, onRecordingComplete]);

  const playRecording = useCallback(async () => {
    try {
      if (!isNitroInitializedRef.current) {
        throw new Error('Audio module not initialized');
      }

      if (soundRef.current) {
        // Stop current playback using correct API
        await Sound.stopPlayer();
        soundRef.current = null;
        return;
      }

      const uri = recordingUriRef.current;
      if (uri) {
        // Play recording using correct API
        const success = await Sound.startPlayer(uri);
        if (success) {
          soundRef.current = uri;
        }
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error('Failed to play recording')
      );
    }
  }, [onError]);

  const lockRecording = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockRecording = useCallback(() => {
    setIsLocked(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const getAmplitude = useCallback(async (): Promise<number> => {
    try {
      if (!isNitroInitializedRef.current) {
        return 0;
      }

      // Get amplitude - fallback if method doesn't exist
      const amplitude = (await (Sound as any).getRecordingAmplitude?.()) || 0;
      return amplitude;
    } catch (error) {
      return 0;
    }
  }, []);

  return {
    // State
    isRecording,
    isLocked,
    isPaused,
    duration,
    waveform,
    recordingUri: recordingUriRef.current,

    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    sendRecording,
    playRecording,
    lockRecording,
    unlockRecording,

    // Utilities
    formatTime,
    getAmplitude,
    cleanupTimers,
  };
};

/**
 * Hook for managing gesture-based recording
 */
export const useVoiceRecordingGesture = (
  voiceRecording: ReturnType<typeof useVoiceRecording>
) => {
  const panOffsetRef = useRef({ x: 0, y: 0 });

  const handlePanMove = useCallback(
    (event: any) => {
      const { dy, dx } = event.nativeEvent || {};

      if (!voiceRecording.isRecording) return;

      panOffsetRef.current = { x: dx, y: dy };

      // Lock if slid up more than 60px
      if (dy < -60 && !voiceRecording.isLocked) {
        voiceRecording.lockRecording();
      } else if (dy > -60 && voiceRecording.isLocked) {
        voiceRecording.unlockRecording();
      }
    },
    [voiceRecording.isRecording, voiceRecording.isLocked]
  );

  const handlePanEnd = useCallback(() => {
    // Cancel if released without locking
    if (!voiceRecording.isLocked && panOffsetRef.current.y > -60) {
      voiceRecording.cancelRecording();
    }
    panOffsetRef.current = { x: 0, y: 0 };
  }, [voiceRecording.isLocked]);

  return {
    handlePanMove,
    handlePanEnd,
    panOffset: panOffsetRef.current,
  };
};

/**
 * Hook for managing voice recording with message sending
 */
export const useVoiceRecordingWithMessage = () => {
  const [messages, setMessages] = useState<any[]>([]);

  const voiceRecording = useVoiceRecording({
    onRecordingComplete: (uri: string, duration: number) => {
      const message = {
        id: Date.now().toString(),
        text: uri,
        timestamp: new Date(),
        type: 'voice',
        duration,
      };

      setMessages(prev => [...prev, message]);
    },
  });

  return {
    messages,
    setMessages,
    voiceRecording,
  };
};

/**
 * Hook for audio playback management
 */
export const useAudioPlayback = () => {
  const soundRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playAudio = useCallback(async (uri: string) => {
    try {
      if (soundRef.current) {
        await Sound.stopPlayer();
      }

      // Play using correct API
      const success = await Sound.startPlayer(uri);

      if (success) {
        soundRef.current = uri;
        setIsPlaying(true);

        // Get duration if method exists
        const audioDuration = (await (Sound as any).getDuration?.()) || 0;
        setDuration(audioDuration);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);

  const pauseAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await Sound.stopPlayer();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }, []);

  const stopAudio = useCallback(async () => {
    try {
      if (soundRef.current) {
        await Sound.stopPlayer();
        setIsPlaying(false);
        setCurrentPosition(0);
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }, []);

  return {
    isPlaying,
    currentPosition,
    duration,
    playAudio,
    pauseAudio,
    stopAudio,
  };
};
