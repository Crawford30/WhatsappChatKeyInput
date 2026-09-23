import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  NativeSyntheticEvent,
  Platform,
  TextInput,
  TextInputSelectionChangeEventData,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addRecentEmoji } from '../data/emojiData';
import {
  deleteBackward,
  insertAtSelection,
  Selection,
  TextEdit,
} from '../Helpers/emojiInput';

const isIOS = Platform.OS === 'ios';

// Used until the system keyboard has been opened once and we know its height
const DEFAULT_PANEL_RATIO = 0.38;

// iOS with a hardware keyboard never shows the software one after focus
const KEYBOARD_FALLBACK_MS = 400;

// Height of the attachment menu content (excluding the bottom inset)
export const ATTACH_PANEL_HEIGHT = 132;

export type PanelKind = 'emoji' | 'attach';

const animateLayout = (event?: KeyboardEvent) => {
  const duration = event?.duration || 220;
  const type =
    (event?.easing &&
      LayoutAnimation.Types[
        event.easing as keyof typeof LayoutAnimation.Types
      ]) ||
    LayoutAnimation.Types.keyboard;
  LayoutAnimation.configureNext({ duration, update: { duration, type } });
};

interface UseEmojiKeyboardOptions {
  inputRef: RefObject<TextInput | null>;
  value: string;
  onChangeText: (text: string) => void;
}

/**
 * WhatsApp-style switching between the system keyboard and the panels that
 * replace it (emoji keyboard, attachment menu).
 *
 * The panel takes the height of the last shown keyboard so the input bar stays
 * put when switching. On iOS the keyboard overlays the window, so the bottom
 * area also reserves the keyboard's space; on Android `adjustResize` does that.
 */
export const useEmojiKeyboard = ({
  inputRef,
  value,
  onChangeText,
}: UseEmojiKeyboardOptions) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [activePanel, setActivePanel] = useState<PanelKind | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const panelHeight =
    keyboardHeight || Math.round(windowHeight * DEFAULT_PANEL_RATIO);

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      if (isIOS) animateLayout(event);
      keyboardVisibleRef.current = true;
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = (event: KeyboardEvent) => {
      if (isIOS) animateLayout(event);
      keyboardVisibleRef.current = false;
      setKeyboardVisible(false);
    };
    // Close the panel only once the keyboard fully covers it
    const onDidShow = () => setActivePanel(null);

    const subscriptions = isIOS
      ? [
          Keyboard.addListener('keyboardWillShow', onShow),
          Keyboard.addListener('keyboardDidShow', onDidShow),
          Keyboard.addListener('keyboardWillHide', onHide),
        ]
      : [
          Keyboard.addListener('keyboardDidShow', event => {
            onShow(event);
            onDidShow();
          }),
          Keyboard.addListener('keyboardDidHide', onHide),
        ];

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const closePanel = useCallback(() => {
    if (!keyboardVisibleRef.current) animateLayout();
    setActivePanel(null);
  }, []);

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

  const openPanel = useCallback((kind: PanelKind) => {
    if (!keyboardVisibleRef.current) animateLayout();
    setActivePanel(kind);
    Keyboard.dismiss();
  }, []);

  // Call from the TextInput's onFocus (tapping the input while the panel is open)
  const handleInputFocus = useCallback(() => {
    if (!isIOS) {
      // adjustResize is about to shrink the window; drop the panel first
      setActivePanel(null);
      return;
    }
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

  // What sits under the input bar: the panel, the space the iOS keyboard
  // covers, or just the home-indicator inset
  const bottomSpace =
    activePanel === 'emoji'
      ? panelHeight
      : activePanel === 'attach'
      ? ATTACH_PANEL_HEIGHT + insets.bottom
      : keyboardVisible && isIOS
      ? keyboardHeight
      : insets.bottom;

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
    panelProps: {
      visible: activePanel === 'emoji',
      height: bottomSpace,
      bottomInset: insets.bottom,
      onEmojiSelect: insertEmoji,
      onBackspace: backspace,
    },
  };
};
