import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import type { VoiceRecording } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const CANCEL_THRESHOLD = -120;

interface VoiceRecorderProps {
  recording: VoiceRecording;
  onCancel: () => void;
  onSend: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  recording,
  onCancel,
  onSend,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < CANCEL_THRESHOLD) {
          // Slide to cancel
          Animated.timing(slideAnim, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onCancel();
          });
        } else {
          // Spring back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    // Pulse animation for recording indicator
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        <Text style={styles.duration}>
          {formatDuration(recording.duration)}
        </Text>
        <View style={styles.waveformContainer}>
          {recording.amplitude.map((amp, index) => (
            <View
              key={index}
              style={[styles.waveformBar, { height: Math.max(4, amp * 30) }]}
            />
          ))}
        </View>
        <Text style={styles.slideText}>{'< Slide to cancel'}</Text>
      </View>
    </Animated.View>
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
});
