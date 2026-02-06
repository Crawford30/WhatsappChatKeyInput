import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Theme colors matching WhatsApp design
 */
export const Colors = {
  // Primary colors
  primary: '#25D366',
  primaryDark: '#20BC5A',
  primaryLight: '#E0F5E9',

  // Message bubbles
  incomingBubble: '#FFFFFF',
  outgoingBubble: '#DCF8C6',

  // Backgrounds
  chatBackground: '#E5DDD5',
  inputBackground: '#FFFFFF',
  panelBackground: '#FFFFFF',
  categoryBarBackground: '#F5F5F5',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#667781',
  textTertiary: '#8E8E93',
  textLight: '#999999',

  // UI elements
  border: '#E0E0E0',
  separator: '#D1D1D6',
  highlight: '#E8E8E8',

  // Status colors
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Voice recording
  recordingIndicator: '#FF3B30',
  waveformActive: '#34C759',
  waveformInactive: '#C7C7CC',
};

/**
 * Spacing constants
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Font sizes
 */
export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

/**
 * Border radius values
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
};

/**
 * Animation durations (in milliseconds)
 */
export const AnimationDuration = {
  fast: 150,
  normal: 250,
  slow: 400,
};

/**
 * Layout dimensions
 */
export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  inputBar: {
    minHeight: 50,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emojiPicker: {
    height: 350,
    emojiSize: width / 8,
    numColumns: 8,
  },
  stickerPicker: {
    height: 350,
    stickerSize: width / 4,
    numColumns: 4,
  },
  iconButton: {
    size: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
};

/**
 * Platform-specific values
 */
export const PlatformConfig = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  keyboardShowEvent:
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
  keyboardHideEvent:
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
  keyboardBehavior: Platform.OS === 'ios' ? 'padding' : undefined,
};

/**
 * Input mode configuration
 */
export const InputConfig = {
  maxTextLength: 1000,
  voiceRecording: {
    minDuration: 1, // seconds
    maxDuration: 300, // 5 minutes
    cancelThreshold: -120, // pixels to slide left
    amplitudeSamples: 20, // number of waveform bars
  },
  emoji: {
    recentLimit: 20,
    categoryIconSize: 24,
    emojiSize: 28,
  },
  sticker: {
    packsLimit: 10,
    stickersPerPack: 30,
  },
};

/**
 * Timing constants
 */
export const Timing = {
  keyboardDismissDelay: 100,
  panelShowDelay: 100,
  doubleTapDelay: 300,
  longPressDelay: 500,
  autoScrollDelay: 100,
};

/**
 * Z-index layers
 */
export const ZIndex = {
  background: 0,
  content: 1,
  panel: 10,
  modal: 100,
  overlay: 1000,
  toast: 10000,
};

/**
 * Shadow styles (iOS-focused)
 */
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
};

/**
 * Gesture thresholds
 */
export const Gestures = {
  swipeThreshold: 50,
  longPressThreshold: 500,
  doubleTapThreshold: 300,
  panThreshold: 10,
};

/**
 * Performance optimization settings
 */
export const Performance = {
  flatList: {
    maxToRenderPerBatch: 50,
    windowSize: 10,
    initialNumToRender: 40,
    removeClippedSubviews: true,
  },
};
