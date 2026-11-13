import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {formatDuration} from '../Helpers/helper';

interface VoiceRecorderProps {
  durationMs: number;
  levels: number[];
  /** How far the finger has slid left (≤ 0), from the mic button's gesture. */
  slideX: Animated.Value;
}

/**
 * Shown in place of the text field while the mic button is held. Display
 * only: the press, slide-to-cancel and release are handled by the mic button,
 * which stays under the finger for the whole gesture.
 */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  durationMs,
  levels,
  slideX,
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 0.25, duration: 500, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1, duration: 500, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // the hint follows the finger and fades out as it nears the cancel point
  const hintOpacity = slideX.interpolate({
    inputRange: [-120, 0],
    outputRange: [0.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.dot, {opacity: pulse}]} />
      <Text style={styles.duration} accessibilityLabel="Recording time">
        {formatDuration(durationMs)}
      </Text>
      <View style={styles.waveform}>
        {levels.slice(-24).map((level, i) => (
          <View key={i} style={[styles.bar, {height: 4 + level * 18}]} />
        ))}
      </View>
      <Animated.Text
        style={[
          styles.hint,
          {opacity: hintOpacity, transform: [{translateX: slideX}]},
        ]}>
        ‹ Slide to cancel
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F15C6D',
    marginRight: 8,
  },
  duration: {
    fontSize: 15,
    color: '#111B21',
    fontVariant: ['tabular-nums'],
    marginRight: 10,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
    marginRight: 10,
  },
  bar: {
    width: 2,
    borderRadius: 1,
    backgroundColor: '#8696A0',
  },
  hint: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: '#667781',
  },
});
