import { Animated, Easing } from 'react-native';

/**
 * Animation configurations for different transitions
 */
export const AnimationConfig = {
  // Quick animations for button presses
  quick: {
    duration: 150,
    useNativeDriver: true,
    easing: Easing.ease,
  },

  // Standard animations for most transitions
  standard: {
    duration: 250,
    useNativeDriver: true,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },

  // Spring animations for natural feel
  spring: {
    tension: 50,
    friction: 8,
    useNativeDriver: true,
  },

  // Slow animations for emphasis
  slow: {
    duration: 400,
    useNativeDriver: true,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },
};

/**
 * Create a fade animation
 */
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 250,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.ease,
  });
};

/**
 * Create a slide animation
 */
export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 250,
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    useNativeDriver: true,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  });
};

/**
 * Create a spring animation
 */
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  tension: number = 50,
  friction: number = 8,
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  });
};

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format timestamp to time string
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format timestamp to date string
 */
export const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Check if emoji is in string
 */
export const containsEmoji = (text: string): boolean => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
};

/**
 * Calculate text input height based on content
 */
export const calculateInputHeight = (
  text: string,
  minHeight: number = 40,
  maxHeight: number = 100,
  lineHeight: number = 20,
): number => {
  const lines = text.split('\n').length;
  const calculatedHeight = Math.min(
    maxHeight,
    Math.max(minHeight, lines * lineHeight + 20), // 20px for padding
  );
  return calculatedHeight;
};

/**
 * Throttle function execution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Haptic feedback (requires react-native-haptic-feedback)
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  // In production, use react-native-haptic-feedback
  // import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
  // ReactNativeHapticFeedback.trigger(type);
  console.log(`Haptic feedback: ${type}`);
};

/**
 * Platform-specific value selector
 */
export const platformValue = <T>(ios: T, android: T): T => {
  return require('react-native').Platform.OS === 'ios' ? ios : android;
};
