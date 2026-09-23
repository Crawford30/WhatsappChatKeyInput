import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { configSecondary, primaryColor } from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { formatDuration } from '../Helpers/helper';
import type { VoiceRecording } from '../types/inputTypes';

interface VoiceRecorderProps {
  recording: VoiceRecording;
  /** Horizontal drag of the mic button (<= 0), driven by the parent's gesture */
  slideX: Animated.Value;
  cancelThreshold: number;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  recording,
  slideX,
  cancelThreshold,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for recording indicator
    const pulse = Animated.loop(
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
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  const hintOpacity = slideX.interpolate({
    inputRange: [cancelThreshold, 0],
    outputRange: [0.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        themeStyles.flexRow,
        themeStyles.flexNullCenter,
        styles.container,
      ]}>
      <Animated.View
        style={[
          styles.recordingIndicator,
          { transform: [{ scale: scaleAnim }] },
        ]}
      />
      <Text style={styles.duration}>{formatDuration(recording.duration)}</Text>
      <View
        style={[
          themeStyles.flex1,
          themeStyles.flexRow,
          themeStyles.flexNullCenter,
          styles.waveform,
        ]}>
        {recording.amplitude.map((amp, index) => (
          <View
            key={index}
            style={[styles.waveformBar, { height: Math.max(4, amp * 24) }]}
          />
        ))}
      </View>
      <Animated.Text
        style={[
          styles.slideText,
          { opacity: hintOpacity, transform: [{ translateX: slideX }] },
        ]}>
        {'‹  Slide to cancel'}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    paddingHorizontal: 16,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  duration: {
    fontSize: 15,
    color: 'black',
    fontVariant: ['tabular-nums'],
    marginRight: 12,
  },
  waveform: {
    height: 24,
    gap: 2,
    overflow: 'hidden',
  },
  waveformBar: {
    width: 3,
    backgroundColor: primaryColor,
    borderRadius: 1.5,
  },
  slideText: {
    fontSize: 14,
    color: configSecondary,
    marginLeft: 12,
  },
});
