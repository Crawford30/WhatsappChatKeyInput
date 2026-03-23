import React, { useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { triggerHaptic } from '../utils/hapticUtils';
import { MicrophoneSVG } from '../svg/svgIcons';

interface Props {
  onPressIn: () => void;
  onPressOut: () => void;
  isRecording: boolean;
}

/**
 * MicButton
 *
 * A press-and-hold button that triggers voice recording.
 * Animates to red + scale-up while recording.
 */
export const MicButton: React.FC<Props> = ({
  onPressIn,
  onPressOut,
  isRecording,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    triggerHaptic('light');
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.12,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    onPressIn();
  }, [scaleAnim, colorAnim, onPressIn]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    onPressOut();
  }, [scaleAnim, colorAnim, onPressOut]);

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00A884', '#FF3B30'],
  });

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchable}>
        <Animated.View style={[styles.btn, { backgroundColor: bgColor }]}>
          <MicrophoneSVG size={22} fill="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: 48, height: 48 },
  touchable: { flex: 1 },
  btn: {
    flex: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
  },
});
