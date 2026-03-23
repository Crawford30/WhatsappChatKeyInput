import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'warning';

export const triggerHaptic = (type: HapticType = 'medium') => {
  const typeMap: Record<HapticType, HapticFeedbackTypes> = {
    light: HapticFeedbackTypes.impactLight,
    medium: HapticFeedbackTypes.impactMedium,
    heavy: HapticFeedbackTypes.impactHeavy,
    success: HapticFeedbackTypes.notificationSuccess,
    error: HapticFeedbackTypes.notificationError,
    warning: HapticFeedbackTypes.notificationWarning,
  };

  ReactNativeHapticFeedback.trigger(typeMap[type], options);
};
