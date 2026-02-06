import { useEffect, useRef, useState, useCallback } from 'react';
import { Keyboard, KeyboardEvent, Platform, Animated } from 'react-native';

/**
 * Custom hook to manage keyboard visibility state
 */
export const useKeyboard = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };

    const handleKeyboardHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      showEvent,
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      hideEvent,
      handleKeyboardHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

/**
 * Custom hook for managing animated panel transitions
 */
export const useAnimatedPanel = (
  initialHeight: number = 0,
  targetHeight: number = 350,
) => {
  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    setIsVisible(true);
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [heightAnim, targetHeight]);

  const hide = useCallback(() => {
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setIsVisible(false);
    });
  }, [heightAnim]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return { heightAnim, isVisible, show, hide, toggle };
};

/**
 * Custom hook for voice recording timer and amplitude tracking
 */
export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [amplitude, setAmplitude] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setDuration(0);
    setAmplitude([]);

    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      // Simulate amplitude changes (in production, use actual audio levels)
      setAmplitude(prev => [...prev.slice(-20), Math.random() * 0.8 + 0.2]);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setDuration(0);
    setAmplitude([]);
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    duration,
    amplitude,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};

/**
 * Custom hook for managing input mode state transitions
 */
export const useInputMode = <T extends string>(initialMode: T) => {
  const [mode, setMode] = useState<T>(initialMode);
  const previousMode = useRef<T>(initialMode);

  const changeMode = useCallback(
    (newMode: T) => {
      previousMode.current = mode;
      setMode(newMode);
    },
    [mode],
  );

  const revertMode = useCallback(() => {
    setMode(previousMode.current);
  }, []);

  const isMode = useCallback((checkMode: T) => mode === checkMode, [mode]);

  return {
    mode,
    previousMode: previousMode.current,
    changeMode,
    revertMode,
    isMode,
  };
};

/**
 * Custom hook for debouncing values
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for managing recent items (emojis, stickers, etc.)
 */
export const useRecentItems = <T>(
  storageKey: string,
  maxItems: number = 20,
) => {
  const [recentItems, setRecentItems] = useState<T[]>([]);

  const addRecentItem = useCallback(
    (item: T) => {
      setRecentItems(prev => {
        // Remove duplicates and add to front
        const filtered = prev.filter(i => i !== item);
        const updated = [item, ...filtered].slice(0, maxItems);

        // In production, save to AsyncStorage here
        // AsyncStorage.setItem(storageKey, JSON.stringify(updated));

        return updated;
      });
    },
    [maxItems, storageKey],
  );

  const loadRecentItems = useCallback(async () => {
    // In production, load from AsyncStorage here
    // const stored = await AsyncStorage.getItem(storageKey);
    // if (stored) setRecentItems(JSON.parse(stored));
  }, [storageKey]);

  useEffect(() => {
    loadRecentItems();
  }, [loadRecentItems]);

  return { recentItems, addRecentItem };
};
