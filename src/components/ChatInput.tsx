import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated as RNAnimated,
  BackHandler,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Vibration,
  type TextInputInstance,
  type TextInputSelectionChangeEvent,
} from 'react-native';
import {
  KeyboardController,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scheduleOnRN} from 'react-native-worklets';
import {EMOJI_CATEGORIES} from '../data/emojiData';
import {deleteBeforeCursor, generateId} from '../Helpers/helper';
import {useRecentItems, useVoiceRecording} from '../hooks/useInputHook';
import type {InputMode, Message, Sticker} from '../types/inputTypes';
import {EmojiPicker} from './EmojiPicker';
import {StickerPicker} from './StickerPicker';
import {VoiceRecorder} from './VoiceRecorder';

/** Panel height until the keyboard has been opened once and measured. */
const DEFAULT_PANEL_HEIGHT = 300;
const CANCEL_DISTANCE = -120;
const MIN_VOICE_MS = 600;
const PANEL_ANIMATION = {duration: 220};

/** A message as composed here; id, sender and time are added on send. */
type NewMessage = Message extends infer M
  ? M extends Message
    ? Omit<M, 'id' | 'fromMe' | 'timestamp'>
    : never
  : never;

export interface ChatInputHandle {
  /** Hides the keyboard or emoji/sticker panel (e.g. when the list is dragged). */
  close: () => void;
}

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
  ref?: React.Ref<ChatInputHandle>;
}

/**
 * WhatsApp-style input bar. The space below it is one animated spacer whose
 * height is max(keyboard, emoji/sticker panel, bottom safe area). The panel
 * always takes the keyboard's last measured height, so switching between the
 * keyboard and a panel swaps what fills the space without moving the input.
 */
export const ChatInput: React.FC<ChatInputProps> = ({onSendMessage, ref}) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInputInstance>(null);

  const [mode, setMode] = useState<InputMode>('idle');
  const [panelSize, setPanelSize] = useState(
    DEFAULT_PANEL_HEIGHT + insets.bottom,
  );
  const [text, setText] = useState('');
  const selection = useRef({start: 0, end: 0});
  const [hint, setHint] = useState<string | null>(null);

  const {recentItems: recentEmojis, addRecentItem: addRecentEmoji} =
    useRecentItems<string>(EMOJI_CATEGORIES[0].emojis);
  const voice = useVoiceRecording();

  // ---- keyboard / panel geometry (UI thread) -----------------------------
  const keyboardHeight = useSharedValue(0);
  const panelHeight = useSharedValue(0);
  /** Collapse the panel once the keyboard has fully replaced it. */
  const collapsePanelOnKeyboard = useSharedValue(false);

  const onKeyboardSettled = useCallback((height: number) => {
    if (height > 0) {
      setPanelSize(prev => (Math.abs(prev - height) > 1 ? height : prev));
      setMode('keyboard');
    } else {
      setMode(m => (m === 'keyboard' ? 'idle' : m));
    }
  }, []);

  useKeyboardHandler(
    {
      onMove: e => {
        'worklet';
        keyboardHeight.value = e.height;
      },
      onInteractive: e => {
        'worklet';
        keyboardHeight.value = e.height;
      },
      onEnd: e => {
        'worklet';
        keyboardHeight.value = e.height;
        if (e.height > 0 && collapsePanelOnKeyboard.value) {
          collapsePanelOnKeyboard.value = false;
          panelHeight.value = 0;
        }
        scheduleOnRN(onKeyboardSettled, e.height);
      },
    },
    [onKeyboardSettled],
  );

  const bottomInset = insets.bottom;
  const spacerStyle = useAnimatedStyle(
    () => ({
      height: Math.max(keyboardHeight.value, panelHeight.value, bottomInset),
    }),
    [bottomInset],
  );

  // ---- panel switching ---------------------------------------------------
  const openPanel = useCallback(
    (next: 'emoji' | 'sticker') => {
      collapsePanelOnKeyboard.value = false;
      if (mode === 'keyboard') {
        // the panel takes the keyboard's place instantly; nothing moves
        panelHeight.value = panelSize;
        KeyboardController.dismiss();
      } else {
        panelHeight.value = withTiming(panelSize, PANEL_ANIMATION);
      }
      setMode(next);
    },
    [mode, panelSize, panelHeight, collapsePanelOnKeyboard],
  );

  const showKeyboard = useCallback(() => {
    // keep the panel until the keyboard covers it, then collapse it
    collapsePanelOnKeyboard.value = panelHeight.value > 0;
    setMode('keyboard');
    inputRef.current?.focus();
  }, [panelHeight, collapsePanelOnKeyboard]);

  const close = useCallback(() => {
    collapsePanelOnKeyboard.value = false;
    KeyboardController.dismiss();
    panelHeight.value = withTiming(0, PANEL_ANIMATION);
    setMode('idle');
  }, [panelHeight, collapsePanelOnKeyboard]);

  useImperativeHandle(ref, () => ({close}), [close]);

  const panelOpen = mode === 'emoji' || mode === 'sticker';

  // Android back closes an open panel before leaving the screen
  useEffect(() => {
    if (!panelOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [panelOpen, close]);

  const togglePanel = (target: 'emoji' | 'sticker') =>
    mode === target ? showKeyboard() : openPanel(target);

  // ---- text editing --------------------------------------------------------
  const onSelectionChange = (e: TextInputSelectionChangeEvent) => {
    selection.current = e.nativeEvent.selection;
  };

  const insertEmoji = useCallback(
    (emoji: string) => {
      addRecentEmoji(emoji);
      setText(prev => {
        const start = Math.min(selection.current.start, prev.length);
        const end = Math.min(selection.current.end, prev.length);
        const cursor = start + emoji.length;
        selection.current = {start: cursor, end: cursor};
        return prev.slice(0, start) + emoji + prev.slice(end);
      });
    },
    [addRecentEmoji],
  );

  const backspace = useCallback(() => {
    setText(prev => {
      const {start, end} = selection.current;
      if (start !== end) {
        selection.current = {start, end: start};
        return prev.slice(0, start) + prev.slice(end);
      }
      const result = deleteBeforeCursor(prev, Math.min(end, prev.length));
      selection.current = {start: result.cursor, end: result.cursor};
      return result.text;
    });
  }, []);

  const send = useCallback(
    (message: NewMessage) =>
      onSendMessage({
        ...message,
        id: generateId(),
        fromMe: true,
        timestamp: new Date(),
      } as Message),
    [onSendMessage],
  );

  const sendText = () => {
    const body = text.trim();
    if (body) {
      send({type: 'text', text: body});
      setText('');
      selection.current = {start: 0, end: 0};
    }
  };

  const sendSticker = useCallback(
    (sticker: Sticker) => send({type: 'sticker', sticker: sticker.emoji}),
    [send],
  );

  // ---- hold to record ----------------------------------------------------
  const showHint = useCallback((message: string) => {
    setHint(message);
    setTimeout(() => setHint(null), 1800);
  }, []);

  const slideX = useRef(new RNAnimated.Value(0)).current;
  const micScale = useRef(new RNAnimated.Value(1)).current;
  const gesture = useRef({cancelled: false});
  // the responder is created once; it reads the latest callbacks from here
  const latest = useRef({voice, send, showHint});
  latest.current = {voice, send, showHint};

  const resetMic = () => {
    RNAnimated.parallel([
      RNAnimated.spring(slideX, {toValue: 0, useNativeDriver: true}),
      RNAnimated.spring(micScale, {toValue: 1, useNativeDriver: true}),
    ]).start();
  };

  const micResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        gesture.current.cancelled = false;
        latest.current.voice.start();
        Vibration.vibrate(15);
        RNAnimated.spring(micScale, {
          toValue: 1.4,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, g) => {
        if (gesture.current.cancelled) {
          return;
        }
        slideX.setValue(Math.min(0, g.dx));
        if (g.dx < CANCEL_DISTANCE) {
          gesture.current.cancelled = true;
          latest.current.voice.stop();
          Vibration.vibrate(30);
          resetMic();
        }
      },
      onPanResponderRelease: () => {
        resetMic();
        if (gesture.current.cancelled) {
          return;
        }
        const elapsed = latest.current.voice.stop();
        if (elapsed < MIN_VOICE_MS) {
          latest.current.showHint('Hold to record, release to send');
        } else {
          latest.current.send({type: 'voice', durationMs: elapsed});
        }
      },
      onPanResponderTerminate: () => {
        gesture.current.cancelled = true;
        latest.current.voice.stop();
        resetMic();
      },
    }),
  ).current;

  // ---- render --------------------------------------------------------------
  const hasText = text.trim().length > 0;

  return (
    <View style={styles.container}>
      {hint && (
        <View style={styles.hintBubble} pointerEvents="none">
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}

      <View style={styles.bar}>
        {voice.isRecording ? (
          <VoiceRecorder
            durationMs={voice.durationMs}
            levels={voice.levels}
            slideX={slideX}
          />
        ) : (
          <View style={styles.field}>
            <Pressable
              style={styles.fieldButton}
              accessibilityRole="button"
              accessibilityLabel={mode === 'emoji' ? 'Keyboard' : 'Emoji'}
              hitSlop={6}
              onPress={() => togglePanel('emoji')}>
              <Text style={styles.fieldIcon}>
                {mode === 'emoji' ? '⌨️' : '😊'}
              </Text>
            </Pressable>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              onSelectionChange={onSelectionChange}
              onFocus={() => {
                if (panelOpen) {
                  showKeyboard();
                }
              }}
              placeholder="Message"
              placeholderTextColor="#8696A0"
              multiline
              maxLength={4096}
            />
            {!hasText && (
              <Pressable
                style={styles.fieldButton}
                accessibilityRole="button"
                accessibilityLabel={mode === 'sticker' ? 'Keyboard' : 'Stickers'}
                hitSlop={6}
                onPress={() => togglePanel('sticker')}>
                <Text style={styles.fieldIcon}>
                  {mode === 'sticker' ? '⌨️' : '🗒️'}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {hasText ? (
          <Pressable
            style={styles.roundButton}
            accessibilityRole="button"
            accessibilityLabel="Send"
            onPress={sendText}>
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        ) : (
          <RNAnimated.View
            {...micResponder.panHandlers}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Hold to record a voice message"
            style={[styles.roundButton, {transform: [{scale: micScale}]}]}>
            <Text style={styles.micIcon}>🎤</Text>
          </RNAnimated.View>
        )}
      </View>

      <Animated.View style={[styles.spacer, spacerStyle]}>
        {/* the keyboard's height includes the home indicator / nav bar, so
            keep the pickers' tab bars clear of it */}
        {panelOpen && (
          <View style={{height: panelSize, paddingBottom: insets.bottom}}>
            {mode === 'emoji' ? (
              <EmojiPicker
                height={panelSize - insets.bottom}
                recents={recentEmojis}
                onEmojiSelect={insertEmoji}
                onBackspace={backspace}
              />
            ) : (
              <StickerPicker
                height={panelSize - insets.bottom}
                onStickerSelect={sendSticker}
              />
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F2F5',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 6,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  fieldButton: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldIcon: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 2,
    fontSize: 16,
    lineHeight: 21,
    color: '#111B21',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 3,
  },
  micIcon: {
    fontSize: 20,
  },
  spacer: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  hintBubble: {
    position: 'absolute',
    right: 12,
    bottom: '100%',
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B4A54',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});
