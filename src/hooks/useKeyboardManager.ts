import { useEffect, useState, useCallback, useRef } from 'react';
import { Keyboard, KeyboardEvent, Platform, Animated } from 'react-native';

const PANEL_HEIGHT = 350;

export const useKeyboardManager = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      if (isPanelOpen) closePanel();
    };

    const onHide = () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => { subShow.remove(); subHide.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelOpen]);

  const openPanel = useCallback(() => {
    Keyboard.dismiss();
    setIsPanelOpen(true);
    Animated.spring(panelAnim, {
      toValue: PANEL_HEIGHT,
      useNativeDriver: false,
      tension: 55,
      friction: 9,
    }).start();
  }, [panelAnim]);

  const closePanel = useCallback(() => {
    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start(() => setIsPanelOpen(false));
  }, [panelAnim]);

  const togglePanel = useCallback(() => {
    if (isPanelOpen) closePanel();
    else openPanel();
  }, [isPanelOpen, openPanel, closePanel]);

  const onInputFocus = useCallback(() => {
    if (isPanelOpen) closePanel();
  }, [isPanelOpen, closePanel]);

  return {
    isKeyboardVisible,
    keyboardHeight,
    isPanelOpen,
    panelAnim,
    panelHeight: PANEL_HEIGHT,
    openPanel,
    closePanel,
    togglePanel,
    onInputFocus,
  };
};
