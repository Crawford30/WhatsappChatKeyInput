import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useVoiceRecorder } from '../common/VoiceRecorderContext';
import { RecordingState } from '../common/VoiceRecorderService';

const { width } = Dimensions.get('window');
const CANCEL_THRESHOLD = -120; // Slide left to cancel
const LOCK_THRESHOLD = -80; // Slide up to lock

interface VoiceRecorderProps {
  onCancel: () => void;
  onComplete: (audioData: any) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onCancel,
  onComplete,
}) => {
  const {
    recordingState,
    recordTime,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const [isLocked, setIsLocked] = useState(false);
  const [amplitude, setAmplitude] = useState<number[]>([]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lockIconAnim = useRef(new Animated.Value(0)).current;
  const cancelIconAnim = useRef(new Animated.Value(0)).current;

  // Generate fake waveform
  useEffect(() => {
    const interval = setInterval(() => {
      setAmplitude(prev => [...prev.slice(-20), Math.random() * 0.8 + 0.2]);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const resetAnimations = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(lockIconAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cancelIconAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, lockIconAnim, cancelIconAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLocked,
      onMoveShouldSetPanResponder: () => !isLocked,

      onPanResponderMove: (_, gestureState) => {
        if (isLocked) return;

        const { dx, dy } = gestureState;

        // Only allow left and up movements
        const clampedDx = Math.min(0, dx);
        const clampedDy = Math.min(0, dy);

        slideAnim.setValue(clampedDx);

        // Show cancel hint when sliding left
        if (clampedDx < CANCEL_THRESHOLD / 2) {
          const progress = Math.min(
            1,
            Math.abs(clampedDx) / Math.abs(CANCEL_THRESHOLD)
          );
          cancelIconAnim.setValue(progress);
        } else {
          cancelIconAnim.setValue(0);
        }

        // Show lock hint when sliding up
        if (clampedDy < LOCK_THRESHOLD / 2) {
          const progress = Math.min(
            1,
            Math.abs(clampedDy) / Math.abs(LOCK_THRESHOLD)
          );
          lockIconAnim.setValue(progress);
        } else {
          lockIconAnim.setValue(0);
        }
      },

      onPanResponderRelease: async (_, gestureState) => {
        if (isLocked) return;

        const { dx, dy } = gestureState;

        // Check if should cancel (slid left enough)
        if (dx < CANCEL_THRESHOLD) {
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(async () => {
            await cancelRecording();
            onCancel();
          });
          return;
        }

        // Check if should lock (slid up enough)
        if (dy < LOCK_THRESHOLD) {
          setIsLocked(true);
          resetAnimations();
          return;
        }

        // Otherwise, send the recording
        await handleSend();
      },
    })
  ).current;

  const handleSend = useCallback(async () => {
    try {
      const audioData = await stopRecording();
      if (audioData) {
        onComplete(audioData);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    } finally {
      setIsLocked(false);
      resetAnimations();
    }
  }, [stopRecording, onComplete, resetAnimations]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelRecording();
      onCancel();
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    } finally {
      setIsLocked(false);
      resetAnimations();
    }
  }, [cancelRecording, onCancel, resetAnimations]);

  const handlePauseResume = useCallback(async () => {
    if (recordingState === RecordingState.RECORDING) {
      await pauseRecording();
    } else if (recordingState === RecordingState.PAUSED) {
      await resumeRecording();
    }
  }, [recordingState, pauseRecording, resumeRecording]);

  if (!isLocked) {
    // ORIGINAL UI - Slide to cancel mode
    return (
      <Animated.View
        style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
        {...panResponder.panHandlers}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.recordingIndicator,
              { transform: [{ scale: scaleAnim }] },
            ]}
          />
          <Text style={styles.duration}>{recordTime}</Text>
          <View style={styles.waveformContainer}>
            {amplitude.map((amp, index) => (
              <View
                key={index}
                style={[styles.waveformBar, { height: Math.max(4, amp * 30) }]}
              />
            ))}
          </View>
          <Text style={styles.slideText}>{'< Slide to cancel'}</Text>
        </View>

        {/* Lock indicator (appears when sliding up) */}
        <Animated.View
          style={[
            styles.lockIndicator,
            {
              opacity: lockIconAnim,
              transform: [
                {
                  translateY: lockIconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockHint}>Slide up to lock</Text>
        </Animated.View>
      </Animated.View>
    );
  }

  // LOCKED MODE - Show controls
  return (
    <View style={styles.lockedContainer}>
      <View style={styles.lockedHeader}>
        <View style={styles.recordingInfo}>
          <View style={styles.recordingDotLocked} />
          <Text style={styles.durationLocked}>{recordTime}</Text>
        </View>
        <Text style={styles.lockedIconText}>🔒</Text>
      </View>

      <View style={styles.controlsContainer}>
        {/* Delete button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCancel}
          activeOpacity={0.7}>
          <Text style={styles.controlIcon}>🗑️</Text>
        </TouchableOpacity>

        {/* Pause/Resume button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.pauseButton]}
          onPress={handlePauseResume}
          activeOpacity={0.7}>
          <Text style={styles.controlIcon}>
            {recordingState === RecordingState.PAUSED ? '▶️' : '⏸️'}
          </Text>
        </TouchableOpacity>

        {/* Send button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.sendButton]}
          onPress={handleSend}
          activeOpacity={0.7}>
          <Text style={styles.controlIcon}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 12,
  },
  duration: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    backgroundColor: '#34C759',
    borderRadius: 1.5,
  },
  slideText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 12,
  },
  lockIndicator: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 32,
  },
  lockHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  lockedContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDotLocked: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  durationLocked: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  lockedIconText: {
    fontSize: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  pauseButton: {
    backgroundColor: '#FFA726',
  },
  sendButton: {
    backgroundColor: '#00A884',
  },
  controlIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
