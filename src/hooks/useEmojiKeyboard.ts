import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
  useWindowDimensions,
} from 'react-native';
import {
  KeyboardController,
  KeyboardEvents,
  useKeyboardController,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addRecentEmoji } from '../data/emojiData';
import {
  deleteBackward,
  insertAtSelection,
  Selection,
  TextEdit,
} from '../Helpers/emojiInput';

// Used until the system keyboard has been opened once and we know its height
const DEFAULT_PANEL_RATIO = 0.33;

// Remembered across screens so the panel matches the keyboard from the start
export const DEFAULT_MIN_BOTTOM_INSET = 6;

let lastKeyboardHeight = 0;

// A hardware keyboard never shows the software one after focus
const KEYBOARD_FALLBACK_MS = 400;

// Panels opened or closed without the keyboard slide like the keyboard does
const PANEL_ANIMATION = {
  duration: 250,
  easing: Easing.bezier(0.2, 0.9, 0.3, 1),
};

// Height of the attachment menu content (excluding the bottom inset)
export const ATTACH_PANEL_HEIGHT = 132;

export type PanelKind = 'emoji' | 'attach';

interface UseEmojiKeyboardOptions {
  inputRef: RefObject<TextInput | null>;
  value: string;
  onChangeText: (text: string) => void;
  /** Least space kept under the input bar when nothing else fills it */
  minBottomInset?: number;
}

/**
 * WhatsApp-style switching between the system keyboard and the panels that
 * replace it (emoji keyboard, attachment menu).
 *
 * The area under the input bar is max(keyboard, panel, bottom inset), with the
 * keyboard part tracked frame by frame by react-native-keyboard-controller.
 * The emoji panel takes the last keyboard's height, so while one slides over
 * the other the area keeps its height and the input bar doesn't move.
 */
export const useEmojiKeyboard = ({
  inputRef,
  value,
  onChangeText,
  minBottomInset = DEFAULT_MIN_BOTTOM_INSET,
}: UseEmojiKeyboardOptions) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [activePanel, setActivePanel] = useState<PanelKind | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(lastKeyboardHeight);

  const keyboardVisibleRef = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Latest text and cursor, read by long-press backspace between renders
  const valueRef = useRef(value);
  const selectionRef = useRef<Selection>({
    start: value.length,
    end: value.length,
  });
  const selectionReported = useRef(false);
  if (value !== valueRef.current) {
    // Changed outside this hook (cleared after send, draft restored, ...):
    // without a fresh cursor from the input, continue from the end
    valueRef.current = value;
    if (!selectionReported.current && !inputRef.current?.isFocused()) {
      selectionRef.current = { start: value.length, end: value.length };
    }
  }
  selectionReported.current = false;

  const emojiPanelHeight =
    keyboardHeight || Math.round(windowHeight * DEFAULT_PANEL_RATIO);
  const attachPanelHeight = ATTACH_PANEL_HEIGHT + insets.bottom;
  const panelHeight =
    activePanel === 'attach' ? attachPanelHeight : emojiPanelHeight;

  // Turn keyboard-controller on only while the chat input is mounted, so the
  // rest of the app can keep Android's normal adjustResize behaviour
  // (<KeyboardProvider enabled={false}> at the root)
  const { enabled: controllerEnabled, setEnabled } = useKeyboardController();
  const wasEnabled = useRef(controllerEnabled);
  useEffect(() => {
    const previous = wasEnabled.current;
    setEnabled(true);
    return () => setEnabled(previous);
  }, [setEnabled]);

  // Keyboard-controller reports the keyboard as a negative translation
  const keyboard = useReanimatedKeyboardAnimation();
  const panelSpace = useSharedValue(0);
  const idleInset = Math.max(insets.bottom, minBottomInset);
  const insetSpace = useSharedValue(idleInset);
  useEffect(() => {
    insetSpace.value = idleInset;
  }, [idleInset, insetSpace]);

  const bottomAreaStyle = useAnimatedStyle(() => ({
    height: Math.max(
      -keyboard.height.value,
      panelSpace.value,
      insetSpace.value
    ),
  }));

  // Latest heights for event handlers that outlive a render
  const heightsRef = useRef({
    emoji: emojiPanelHeight,
    attach: attachPanelHeight,
  });
  heightsRef.current = { emoji: emojiPanelHeight, attach: attachPanelHeight };

  /**
   * Show a panel (or none). The reserved space is written straight to the UI
   * thread, so the input bar holds its place even if React is still busy
   * rendering the panel when the keyboard starts to slide away.
   */
  const showPanel = useCallback(
    (kind: PanelKind | null) => {
      const target = kind ? heightsRef.current[kind] : 0;
      // Under a visible keyboard the change can't be seen, so skip animating
      panelSpace.value = keyboardVisibleRef.current
        ? target
        : withTiming(target, PANEL_ANIMATION);
      setActivePanel(kind);
    },
    [panelSpace]
  );

  // Keep the space in step if the panel's height changes while it's open
  // (e.g. the first real keyboard height arrives)
  useEffect(() => {
    if (activePanel) panelSpace.value = panelHeight;
  }, [activePanel, panelHeight, panelSpace]);

  useEffect(() => {
    const subscriptions = [
      KeyboardEvents.addListener('keyboardWillShow', event => {
        keyboardVisibleRef.current = true;
        setKeyboardVisible(true);
        // Floating keyboards report 0 and don't take space
        if (event.height > 0) {
          lastKeyboardHeight = event.height;
          setKeyboardHeight(event.height);
        }
      }),
      // Close the panel only once the keyboard fully covers it
      KeyboardEvents.addListener('keyboardDidShow', () => showPanel(null)),
      KeyboardEvents.addListener('keyboardWillHide', () => {
        keyboardVisibleRef.current = false;
        setKeyboardVisible(false);
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, [showPanel]);

  const closePanel = useCallback(() => showPanel(null), [showPanel]);

  // Android back button closes the panel before leaving the screen
  useEffect(() => {
    if (!activePanel) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closePanel();
        return true;
      }
    );
    return () => subscription.remove();
  }, [activePanel, closePanel]);

  const openPanel = useCallback(
    (kind: PanelKind) => {
      showPanel(kind);
      // RN's Keyboard.dismiss() can miss on some Android devices (it needs RN
      // to know the focused input); this hides the IME natively
      KeyboardController.dismiss();
    },
    [showPanel]
  );

  // Call from the TextInput's onFocus (tapping the input while the panel is
  // open). The panel stays until the keyboard has slid over it.
  const handleInputFocus = useCallback(() => {
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = setTimeout(() => {
      if (!keyboardVisibleRef.current) closePanel();
    }, KEYBOARD_FALLBACK_MS);
  }, [closePanel]);

  const openSystemKeyboard = useCallback(() => {
    const { start, end } = selectionRef.current;
    inputRef.current?.focus();
    inputRef.current?.setSelection(start, end);
  }, [inputRef]);

  const isEmojiMode = activePanel === 'emoji' && !keyboardVisible;

  const openEmojiKeyboard = useCallback(() => openPanel('emoji'), [openPanel]);

  const toggleEmojiKeyboard = useCallback(() => {
    if (isEmojiMode) openSystemKeyboard();
    else openEmojiKeyboard();
  }, [isEmojiMode, openSystemKeyboard, openEmojiKeyboard]);

  const toggleAttachMenu = useCallback(() => {
    if (activePanel === 'attach') closePanel();
    else openPanel('attach');
  }, [activePanel, closePanel, openPanel]);

  const applyEdit = useCallback(
    ({ text, cursor }: TextEdit) => {
      valueRef.current = text;
      selectionRef.current = { start: cursor, end: cursor };
      onChangeText(text);
    },
    [onChangeText]
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      addRecentEmoji(emoji);
      applyEdit(
        insertAtSelection(valueRef.current, selectionRef.current, emoji)
      );
    },
    [applyEdit]
  );

  const backspace = useCallback(() => {
    applyEdit(deleteBackward(valueRef.current, selectionRef.current));
  }, [applyEdit]);

  // Compose with any existing onSelectionChange handler
  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      selectionRef.current = event.nativeEvent.selection;
      selectionReported.current = true;
    },
    []
  );

  return {
    activePanel,
    isEmojiMode,
    toggleEmojiKeyboard,
    toggleAttachMenu,
    openEmojiKeyboard,
    closePanel,
    insertEmoji,
    backspace,
    handleInputFocus,
    handleSelectionChange,
    /** Animated height for the view under the input bar */
    bottomAreaStyle,
    panelProps: {
      height: panelHeight,
      bottomInset: insets.bottom,
      onEmojiSelect: insertEmoji,
      onBackspace: backspace,
    },
  };
};
