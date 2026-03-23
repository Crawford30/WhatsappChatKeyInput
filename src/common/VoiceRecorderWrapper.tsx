import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  PanResponderInstance,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useVoiceRecorder } from './VoiceRecorderContext';
import { MicrophoneSVG } from '../svg/svgIcons';
import { RecordingState } from '../types/inputTypes';

// Safe Haptic Feedback Implementation
const SafeHapticFeedback = {
  impact: (style: 'light' | 'medium' | 'heavy') => {
    try {
      const HapticFeedback = require('../../utils/helperUtils').HapticFeedback;
      if (HapticFeedback && typeof HapticFeedback.impact === 'function') {
        HapticFeedback.impact(style);
      }
    } catch (error) {
      console.warn('Haptic feedback not available', error);
    }
  },
};

interface VoiceRecorderProps {
  onSend: (audioData?: any) => void;
  onCancel: () => void;
  maxRecordingDuration?: number;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSend,
  onCancel,
  maxRecordingDuration = 60,
}) => {
  // Screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const CANCEL_THRESHOLD = screenWidth * 0.3; // 30% of screen width

  // Get voice recorder context
  const {
    recordingState,
    recordTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  // Local state
  const [remainingTime, setRemainingTime] = useState(maxRecordingDuration);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;
  const cancelIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Timer reference
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track press state
  const isPressingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);

  // App state handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App going to background, cancelling recording');
        if (recordingState === RecordingState.RECORDING) {
          handleCancelRecording();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [recordingState]);

  // Start duration timer
  useEffect(() => {
    if (recordingState === RecordingState.RECORDING) {
      setIsRecording(true);
      setRemainingTime(maxRecordingDuration);

      // Start countdown
      recordingTimerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Auto-stop when time is up
            if (recordingTimerRef.current) {
              clearInterval(recordingTimerRef.current);
              recordingTimerRef.current = null;
            }
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Animation for recording state
      Animated.spring(recordingAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Haptic feedback
      SafeHapticFeedback.impact('light');
    } else {
      // Reset recording status
      setIsRecording(false);
      setIsCancelling(false);

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Reset animations
      Animated.spring(recordingAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      Animated.spring(cancelIndicatorAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Reset slide progress
      setSlideProgress(0);
      slideAnim.setValue(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [recordingState, maxRecordingDuration]);

  // PanResponder for swipe-to-cancel
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording && !isCancelling,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return isRecording && !isCancelling && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        console.log('Pan responder granted');
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isRecording || isCancelling) return;

        const slideDistance = Math.abs(gestureState.dx);
        const progress = Math.min(slideDistance / CANCEL_THRESHOLD, 1);

        setSlideProgress(progress);
        slideAnim.setValue(gestureState.dx);

        // Show cancel indicator when sliding
        if (progress > 0.3) {
          Animated.spring(cancelIndicatorAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        } else {
          Animated.spring(cancelIndicatorAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }

        // Auto-cancel if slid far enough
        if (slideDistance >= CANCEL_THRESHOLD) {
          handleCancelRecording();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!isRecording || isCancelling) return;

        const slideDistance = Math.abs(gestureState.dx);

        if (slideDistance >= CANCEL_THRESHOLD) {
          // Already cancelled in onPanResponderMove
          return;
        }

        // Reset slide animation
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        Animated.spring(cancelIndicatorAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();

        setSlideProgress(0);

        // Stop recording if released without sliding
        if (isPressingRef.current) {
          handleStopRecording();
        }
      },
      onPanResponderTerminate: () => {
        // Handle termination (e.g., when another component takes over)
        if (isRecording && !isCancelling) {
          handleCancelRecording();
        }
      },
    })
  ).current;

  const handleStartRecording = async () => {
    if (recordingState !== RecordingState.IDLE || isCancelling) {
      console.log('Cannot start recording:', {
        recordingState,
        isCancelling,
      });
      return;
    }

    console.log('Starting recording...');
    isPressingRef.current = true;
    startTimeRef.current = Date.now();

    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      isPressingRef.current = false;
      // Reset state on error
      setIsRecording(false);
      setIsCancelling(false);
    }
  };

  const handleStopRecording = async () => {
    if (
      !isPressingRef.current ||
      recordingState !== RecordingState.RECORDING ||
      isCancelling
    ) {
      console.log('Cannot stop recording:', {
        isPressingRef: isPressingRef.current,
        recordingState,
        isCancelling,
      });
      return;
    }

    console.log('Stopping recording...');
    isPressingRef.current = false;

    // Check minimum recording duration (prevent accidental taps)
    const recordingDuration = Date.now() - startTimeRef.current;
    if (recordingDuration < 500) {
      console.log('Recording too short, cancelling...');
      handleCancelRecording();
      return;
    }

    try {
      const audioData = await stopRecording();
      if (audioData) {
        console.log('Recording completed:', audioData);
        onSend(audioData);
      } else {
        console.log('No audio data received, cancelling...');
        onCancel();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onCancel();
    }
  };

  const handleCancelRecording = async () => {
    if (recordingState !== RecordingState.RECORDING || isCancelling) {
      console.log('Cannot cancel recording:', {
        recordingState,
        isCancelling,
      });
      return;
    }

    console.log('Cancelling recording...');
    setIsCancelling(true);
    isPressingRef.current = false;

    try {
      await cancelRecording();
      onCancel();
      SafeHapticFeedback.impact('medium');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePressIn = () => {
    if (recordingState === RecordingState.IDLE && !isCancelling) {
      handleStartRecording();
    }
  };

  const handlePressOut = () => {
    if (isRecording && !isCancelling && slideProgress < 0.7) {
      handleStopRecording();
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Recording UI */}
      {isRecording && (
        <Animated.View
          style={[
            styles.recordingContainer,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [-CANCEL_THRESHOLD, 0],
                    outputRange: [-CANCEL_THRESHOLD, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.recordTimeText}>{recordTime}</Text>
          {maxRecordingDuration > 0 && (
            <Text style={styles.remainingTimeText}>{remainingTime}s left</Text>
          )}

          {/* Cancel indicator */}
          <Animated.View
            style={[
              styles.cancelIndicator,
              {
                opacity: cancelIndicatorAnim,
                transform: [
                  {
                    scale: cancelIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.cancelText}>🗑️ Release to cancel</Text>
          </Animated.View>

          {/* Slide to cancel text */}
          <Animated.Text
            style={[
              styles.slideToCancelText,
              {
                opacity: slideAnim.interpolate({
                  inputRange: [-CANCEL_THRESHOLD * 0.5, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            ← Slide to cancel
          </Animated.Text>
        </Animated.View>
      )}

      {/* Microphone Button */}
      <TouchableOpacity
        style={[
          styles.microphoneButton,
          isRecording && styles.microphoneButtonRecording,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}>
        <View style={styles.micButtonContainer}>
          <Animated.View
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
              {
                transform: [
                  {
                    scale: recordingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}>
            <MicrophoneSVG fill="white" width={22} height={22} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 60,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    position: 'relative',
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4444',
    marginRight: 10,
  },
  recordTimeText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  remainingTimeText: {
    color: '#666',
    fontSize: 14,
    marginRight: 10,
  },
  slideToCancelText: {
    color: '#666',
    fontSize: 14,
    position: 'absolute',
    right: 15,
  },
  cancelIndicator: {
    position: 'absolute',
    right: 15,
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  cancelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  microphoneButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneButtonRecording: {
    transform: [{ scale: 1.1 }],
  },
  micButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1b75bb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: '#ff4444',
  },
});

export default VoiceRecorder;
