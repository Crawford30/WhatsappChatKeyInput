import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import VoiceRecorderService from './VoiceRecorderService';
import { RecordingState, AudioData } from './VoiceRecorderService';

interface VoiceRecorderContextType {
  // Service instance
  service: VoiceRecorderService;

  // State
  recordingState: RecordingState;
  recordingDuration: number;
  recordTime: string;
  isRecorderVisible: boolean;

  // Recording controls
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioData | null>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;

  // UI controls
  showRecorder: () => void;
  hideRecorder: () => void;

  // Send handler
  handleSendVoiceMessage: (audioData: AudioData) => Promise<void>;
}

const VoiceRecorderContext = createContext<
  VoiceRecorderContextType | undefined
>(undefined);

interface VoiceRecorderProviderProps {
  children: React.ReactNode;
  onSendAudio?: (audioData: AudioData) => Promise<void>;
  minRecordingDuration?: number;
  maxRecordingDuration?: number;
}

export const VoiceRecorderProvider: React.FC<VoiceRecorderProviderProps> = ({
  children,
  onSendAudio,
  minRecordingDuration = 1,
  maxRecordingDuration = 300,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>(
    RecordingState.IDLE
  );
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordTime, setRecordTime] = useState('0:00');
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);

  const serviceRef = useRef<VoiceRecorderService>(
    VoiceRecorderService.getInstance()
  );
  const isProcessingRef = useRef(false);

  // Subscribe to service state changes
  useEffect(() => {
    const unsubscribe = serviceRef.current.subscribe((state, time) => {
      setRecordingState(state);
      setRecordTime(time);

      // Update duration
      const duration = serviceRef.current.getRecordingDuration();
      setRecordingDuration(duration);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-stop at max duration
  useEffect(() => {
    if (
      recordingState === RecordingState.RECORDING &&
      recordingDuration >= maxRecordingDuration * 1000
    ) {
      console.log('[VoiceRecorder] Max duration reached, stopping');
      stopRecording();
    }
  }, [recordingDuration, recordingState, maxRecordingDuration]);

  const startRecording = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log('[VoiceRecorder] Already processing');
      return;
    }

    isProcessingRef.current = true;

    try {
      await serviceRef.current.startRecording();
      setIsRecorderVisible(true);
    } catch (error) {
      console.error('[VoiceRecorder] Failed to start:', error);
      throw error;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log('[VoiceRecorder] Already processing');
      return null;
    }

    isProcessingRef.current = true;

    try {
      const audioData = await serviceRef.current.stopRecording();

      if (audioData && audioData.duration < minRecordingDuration) {
        console.log('[VoiceRecorder] Recording too short');
        return null;
      }

      return audioData;
    } catch (error) {
      console.error('[VoiceRecorder] Failed to stop:', error);
      return null;
    } finally {
      isProcessingRef.current = false;
    }
  }, [minRecordingDuration]);

  const pauseRecording = useCallback(async () => {
    try {
      await serviceRef.current.pauseRecording();
    } catch (error) {
      console.error('[VoiceRecorder] Failed to pause:', error);
      throw error;
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await serviceRef.current.resumeRecording();
    } catch (error) {
      console.error('[VoiceRecorder] Failed to resume:', error);
      throw error;
    }
  }, []);

  const cancelRecording = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log('[VoiceRecorder] Already processing');
      return;
    }

    isProcessingRef.current = true;

    try {
      await serviceRef.current.cancelRecording();
      setIsRecorderVisible(false);
      setRecordTime('0:00');
    } catch (error) {
      console.error('[VoiceRecorder] Failed to cancel:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  const showRecorder = useCallback(() => {
    setIsRecorderVisible(true);
  }, []);

  const hideRecorder = useCallback(() => {
    setIsRecorderVisible(false);

    // Cancel if recording
    if (
      (recordingState === RecordingState.RECORDING ||
        recordingState === RecordingState.PAUSED) &&
      !isProcessingRef.current
    ) {
      cancelRecording();
    }
  }, [recordingState, cancelRecording]);

  const handleSendVoiceMessage = useCallback(
    async (audioData: AudioData) => {
      if (!audioData || !audioData.uri) {
        console.error('[VoiceRecorder] Invalid audio data');
        return;
      }

      if (audioData.duration < minRecordingDuration) {
        console.error('[VoiceRecorder] Recording too short');
        return;
      }

      try {
        setIsRecorderVisible(false);

        if (onSendAudio) {
          await onSendAudio(audioData);
          console.log('[VoiceRecorder] Voice message sent');
        }
      } catch (error) {
        console.error('[VoiceRecorder] Failed to send:', error);
      }
    },
    [onSendAudio, minRecordingDuration]
  );

  const value: VoiceRecorderContextType = {
    service: serviceRef.current,
    recordingState,
    recordingDuration,
    recordTime,
    isRecorderVisible,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    showRecorder,
    hideRecorder,
    handleSendVoiceMessage,
  };

  return (
    <VoiceRecorderContext.Provider value={value}>
      {children}
    </VoiceRecorderContext.Provider>
  );
};

export const useVoiceRecorder = (): VoiceRecorderContextType => {
  const context = useContext(VoiceRecorderContext);
  if (!context) {
    throw new Error(
      'useVoiceRecorder must be used within VoiceRecorderProvider'
    );
  }
  return context;
};

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useRef,
//   useEffect,
// } from 'react';
// // import VoiceRecorderService, { RecordingState, AudioData } from '../services/VoiceRecorderService';
// import VoiceRecorderService from './VoiceRecorderService';
// import { RecordingState, AudioData } from './VoiceRecorderService';

// interface VoiceRecorderContextType {
//   // Service instance
//   service: VoiceRecorderService;

//   // State
//   recordingState: RecordingState;
//   recordingDuration: number;
//   recordTime: string;
//   isRecorderVisible: boolean;

//   // Recording controls
//   startRecording: () => Promise<void>;
//   stopRecording: () => Promise<AudioData | null>;
//   pauseRecording: () => Promise<void>;
//   resumeRecording: () => Promise<void>;
//   cancelRecording: () => Promise<void>;

//   // UI controls
//   showRecorder: () => void;
//   hideRecorder: () => void;

//   // Send handler
//   handleSendVoiceMessage: (audioData: AudioData) => Promise<void>;
// }

// const VoiceRecorderContext = createContext<
//   VoiceRecorderContextType | undefined
// >(undefined);

// interface VoiceRecorderProviderProps {
//   children: React.ReactNode;
//   onSendAudio?: (audioData: AudioData) => Promise<void>;
//   minRecordingDuration?: number;
//   maxRecordingDuration?: number;
// }

// export const VoiceRecorderProvider: React.FC<VoiceRecorderProviderProps> = ({
//   children,
//   onSendAudio,
//   minRecordingDuration = 1,
//   maxRecordingDuration = 300,
// }) => {
//   const [recordingState, setRecordingState] = useState<RecordingState>(
//     RecordingState.IDLE
//   );
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [recordTime, setRecordTime] = useState('0:00');
//   const [isRecorderVisible, setIsRecorderVisible] = useState(false);

//   const serviceRef = useRef<VoiceRecorderService>(
//     VoiceRecorderService.getInstance()
//   );
//   const isProcessingRef = useRef(false);

//   // Subscribe to service state changes
//   useEffect(() => {
//     const unsubscribe = serviceRef.current.subscribe((state, time) => {
//       setRecordingState(state);
//       setRecordTime(time);

//       // Update duration
//       const duration = serviceRef.current.getRecordingDuration();
//       setRecordingDuration(duration);
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   // Auto-stop at max duration
//   useEffect(() => {
//     if (
//       recordingState === RecordingState.RECORDING &&
//       recordingDuration >= maxRecordingDuration * 1000
//     ) {
//       console.log('[VoiceRecorder] Max duration reached, stopping');
//       stopRecording();
//     }
//   }, [recordingDuration, recordingState, maxRecordingDuration]);

//   const startRecording = useCallback(async () => {
//     if (isProcessingRef.current) {
//       console.log('[VoiceRecorder] Already processing');
//       return;
//     }

//     isProcessingRef.current = true;

//     try {
//       await serviceRef.current.startRecording();
//       setIsRecorderVisible(true);
//     } catch (error) {
//       console.error('[VoiceRecorder] Failed to start:', error);
//       throw error;
//     } finally {
//       isProcessingRef.current = false;
//     }
//   }, []);

//   const stopRecording = useCallback(async () => {
//     if (isProcessingRef.current) {
//       console.log('[VoiceRecorder] Already processing');
//       return null;
//     }

//     isProcessingRef.current = true;

//     try {
//       const audioData = await serviceRef.current.stopRecording();

//       if (audioData && audioData.duration < minRecordingDuration) {
//         console.log('[VoiceRecorder] Recording too short');
//         return null;
//       }

//       return audioData;
//     } catch (error) {
//       console.error('[VoiceRecorder] Failed to stop:', error);
//       return null;
//     } finally {
//       isProcessingRef.current = false;
//     }
//   }, [minRecordingDuration]);

//   const pauseRecording = useCallback(async () => {
//     try {
//       await serviceRef.current.pauseRecording();
//     } catch (error) {
//       console.error('[VoiceRecorder] Failed to pause:', error);
//       throw error;
//     }
//   }, []);

//   const resumeRecording = useCallback(async () => {
//     try {
//       await serviceRef.current.resumeRecording();
//     } catch (error) {
//       console.error('[VoiceRecorder] Failed to resume:', error);
//       throw error;
//     }
//   }, []);

//   const cancelRecording = useCallback(async () => {
//     if (isProcessingRef.current) {
//       console.log('[VoiceRecorder] Already processing');
//       return;
//     }

//     isProcessingRef.current = true;

//     try {
//       await serviceRef.current.cancelRecording();
//       setIsRecorderVisible(false);
//       setRecordTime('0:00');
//     } catch (error) {
//       console.error('[VoiceRecorder] Failed to cancel:', error);
//     } finally {
//       isProcessingRef.current = false;
//     }
//   }, []);

//   const showRecorder = useCallback(() => {
//     setIsRecorderVisible(true);
//   }, []);

//   const hideRecorder = useCallback(() => {
//     setIsRecorderVisible(false);

//     // Cancel if recording
//     if (
//       (recordingState === RecordingState.RECORDING ||
//         recordingState === RecordingState.PAUSED) &&
//       !isProcessingRef.current
//     ) {
//       cancelRecording();
//     }
//   }, [recordingState, cancelRecording]);

//   const handleSendVoiceMessage = useCallback(
//     async (audioData: AudioData) => {
//       if (!audioData || !audioData.uri) {
//         console.error('[VoiceRecorder] Invalid audio data');
//         return;
//       }

//       if (audioData.duration < minRecordingDuration) {
//         console.error('[VoiceRecorder] Recording too short');
//         return;
//       }

//       try {
//         setIsRecorderVisible(false);

//         if (onSendAudio) {
//           await onSendAudio(audioData);
//           console.log('[VoiceRecorder] Voice message sent');
//         }
//       } catch (error) {
//         console.error('[VoiceRecorder] Failed to send:', error);
//       }
//     },
//     [onSendAudio, minRecordingDuration]
//   );

//   const value: VoiceRecorderContextType = {
//     service: serviceRef.current,
//     recordingState,
//     recordingDuration,
//     recordTime,
//     isRecorderVisible,
//     startRecording,
//     stopRecording,
//     pauseRecording,
//     resumeRecording,
//     cancelRecording,
//     showRecorder,
//     hideRecorder,
//     handleSendVoiceMessage,
//   };

//   return (
//     <VoiceRecorderContext.Provider value={value}>
//       {children}
//     </VoiceRecorderContext.Provider>
//   );
// };

// export const useVoiceRecorder = (): VoiceRecorderContextType => {
//   const context = useContext(VoiceRecorderContext);
//   if (!context) {
//     throw new Error(
//       'useVoiceRecorder must be used within VoiceRecorderProvider'
//     );
//   }
//   return context;
// };
