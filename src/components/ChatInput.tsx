import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  PanResponder,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { configSecondary, primaryColor } from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { AttachSVG } from '../assets/svg/AttachSVG';
import { CameraSVG } from '../assets/svg/CameraSVG';
import { ChevronUpSVG } from '../assets/svg/ChevronUpSVG';
import { LockSVG } from '../assets/svg/LockSVG';
import { EmojiSVG } from '../assets/svg/EmojiSVG';
import { KeyboardSVG } from '../assets/svg/KeyboardSVG';
import { MicSVG } from '../assets/svg/MicSVG';
import { SendSVG } from '../assets/svg/SendSVG';
import { setEmojiStorage } from '../data/emojiData';
import { SEARCH_BAR_HEIGHT, useEmojiKeyboard } from '../hooks/useEmojiKeyboard';
import { useVoiceRecording } from '../hooks/useInputHook';
import type {
  Attachment,
  AttachmentPickers,
  EmojiStorage,
  Message,
  Sticker,
  VoiceRecorderAdapter,
} from '../types/inputTypes';
import { AttachmentMenu } from './AttachmentMenu';
import { EditedImage, MediaEditor } from './media/MediaEditor';
import { EmojiKeyboard } from './EmojiKeyboard';
import { EmojiSearch } from './EmojiSearch';
import { VoiceRecorder } from './VoiceRecorder';

const CANCEL_THRESHOLD = -120;
// Slide up this far while holding the mic to keep recording hands-free
const LOCK_THRESHOLD = -80;
const TAP_HINT_MS = 2000;
const ICON_SIZE = 24;

export interface ChatInputProps {
  onSendMessage: (message: Message) => void;
  /** Shown on the photo editor's send row, like WhatsApp */
  recipientName: string;
  /** Controlled text. Leave both out and the input keeps its own state */
  value?: string;
  onChangeText?: (text: string) => void;
  /** Use your own ref, e.g. to focus or move the cursor after a @mention */
  inputRef?: RefObject<TextInput | null>;
  onSelectionChange?: TextInputProps['onSelectionChange'];
  onFocus?: TextInputProps['onFocus'];
  placeholder?: string;
  /** Rendered inside the pill above the text, e.g. a reply preview */
  header?: React.ReactNode;
  /** Attachment sources; the clip and camera buttons hide without them */
  pickers?: AttachmentPickers;
  /**
   * Real audio recorder behind the hold-to-record mic. Without it (and
   * without `voiceButton`) recording is only simulated.
   */
  recorder?: VoiceRecorderAdapter;
  /** Replaces the whole mic button (and its recording UI) while empty */
  voiceButton?: React.ReactNode;
  /** Show the sticker tab in the emoji panel (default true) */
  stickers?: boolean;
  /** Show the view-once toggle in the photo editor (default true) */
  viewOnce?: boolean;
  /**
   * Show the emoji tab in the panel (default true). With `emojis` and
   * `stickers` both off the emoji button is hidden; with only one on, the
   * panel shows just that one, without tabs.
   */
  emojis?: boolean;
  /** Sticker width and height (default 64) */
  stickerSize?: number;
  /** Stickers per row (default 4) */
  stickerColumns?: number;
  /** Merged over the bar's default style (12 sides, 6 top, 0 bottom — the bottom is reserved separately), e.g. `{ paddingHorizontal: 6 }` */
  barStyle?: StyleProp<ViewStyle>;
  /** Least space under the bar when the keyboard and panels are closed. Wins over the safe-area inset only when larger (default 6) */
  minBottomInset?: number;
  /**
   * Remembers recent emoji and skin tones across app restarts, e.g.
   * AsyncStorage or an MMKV wrapper ({ getItem, setItem }). In memory
   * otherwise.
   */
  emojiStorage?: EmojiStorage;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  recipientName,
  value,
  onChangeText,
  inputRef: externalInputRef,
  onSelectionChange,
  onFocus,
  placeholder = 'Message',
  header,
  pickers,
  recorder,
  voiceButton,
  stickers = true,
  viewOnce = true,
  emojis = true,
  stickerSize,
  stickerColumns,
  barStyle,
  minBottomInset,
  emojiStorage,
}) => {
  useEffect(() => {
    setEmojiStorage(emojiStorage);
  }, [emojiStorage]);

  const [ownText, setOwnText] = useState('');
  const text = value ?? ownText;
  const setText = useCallback(
    (next: string) => {
      if (value === undefined) setOwnText(next);
      onChangeText?.(next);
    },
    [value, onChangeText]
  );

  const ownInputRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? ownInputRef;
  const hasText = text.trim().length > 0;

  const emojiKeyboard = useEmojiKeyboard({
    inputRef,
    value: text,
    onChangeText: setText,
    minBottomInset,
  });

  // The emoji panel stays mounted after first use so reopening is instant;
  // opens counts re-read the recents each time
  const [emojiOpens, setEmojiOpens] = useState(0);
  const emojiActive = emojiKeyboard.activePanel === 'emoji';
  useEffect(() => {
    if (emojiActive) setEmojiOpens(count => count + 1);
  }, [emojiActive]);

  const {
    isRecording,
    duration,
    amplitude,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording();

  const handleSendPress = useCallback(() => {
    if (!hasText) return;
    onSendMessage({
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date(),
      type: 'text',
    });
    setText('');
  }, [hasText, text, onSendMessage, setText]);

  // Photos go through the editor first; documents and audio send straight
  // away with any typed text as the caption of the first one
  const [editingImages, setEditingImages] = useState<Attachment[]>([]);

  const handleAttachments = useCallback(
    (attachments: Attachment[]) => {
      const images = attachments.filter(a => a.kind === 'image');
      if (images.length) {
        setEditingImages(images);
        return;
      }
      const caption = text.trim();
      attachments.forEach((attachment, index) => {
        onSendMessage({
          id: `${Date.now()}-${index}`,
          text: index === 0 ? caption : '',
          timestamp: new Date(),
          type: 'attachment',
          attachment,
        });
      });
      if (caption) setText('');
    },
    [text, onSendMessage, setText]
  );

  const handleEditedImages = useCallback(
    (items: EditedImage[], viewOnce: boolean) => {
      items.forEach(({ attachment, caption }, index) => {
        onSendMessage({
          id: `${Date.now()}-${index}`,
          text: caption,
          timestamp: new Date(),
          type: 'attachment',
          attachment,
          viewOnce,
        });
      });
      setEditingImages([]);
      setText('');
    },
    [onSendMessage, setText]
  );

  const runPicker = async (pick: () => Promise<Attachment[]>) => {
    const attachments = await pick();
    if (attachments.length) handleAttachments(attachments);
  };

  // Close the menu first so it doesn't linger behind the system picker
  const fromMenu = (pick: () => Promise<Attachment[]>) => () => {
    emojiKeyboard.closePanel();
    runPicker(pick);
  };

  const handleStickerSelect = useCallback(
    (sticker: Sticker) => {
      onSendMessage({
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        type: 'sticker',
        sticker,
      });
    },
    [onSendMessage]
  );

  // Hold the mic to record, release to send, slide left to cancel. The
  // responder is created once, so it reads the latest handlers from a ref.
  const slideX = useRef(new Animated.Value(0)).current;
  const lockY = useRef(new Animated.Value(0)).current;
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  // A press on the button while locked sends the recording
  const sendTapRef = useRef(false);
  const [showTapHint, setShowTapHint] = useState(false);
  useEffect(() => {
    if (!showTapHint) return;
    const timer = setTimeout(() => setShowTapHint(false), TAP_HINT_MS);
    return () => clearTimeout(timer);
  }, [showTapHint]);
  // The app's recorder can change between renders (its callbacks often
  // depend on its own state), so always call the latest one
  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;
  // Resolves to whether the real recorder actually started
  const recorderStarted = useRef<Promise<boolean> | null>(null);

  const setLock = (next: boolean) => {
    lockedRef.current = next;
    setLocked(next);
    slideX.setValue(0);
    lockY.setValue(0);
  };

  const recordingHandlers = useRef({
    startRecording: () => {},
    finishRecording: (_send: boolean) => {},
    lock: () => {},
  });
  recordingHandlers.current = {
    lock: () => setLock(true),
    startRecording: () => {
      setShowTapHint(false);
      setLock(false);
      startRecording();
      const current = recorderRef.current;
      recorderStarted.current = current
        ? current.start().then(
            () => true,
            error => {
              cancelRecording();
              Alert.alert(
                'Could not start recording',
                error instanceof Error ? error.message : undefined
              );
              return false;
            }
          )
        : null;
    },
    finishRecording: async (send: boolean) => {
      setLock(false);
      // The on-screen timer ticks each second; under 1s counts as a tap
      const longEnough = send && duration > 0;
      if (send && !longEnough) setShowTapHint(true);
      if (send) stopRecording();
      else cancelRecording();

      const started = recorderStarted.current;
      recorderStarted.current = null;
      if (!started) {
        // Simulated recording (no recorder given)
        if (longEnough) {
          onSendMessage({
            id: Date.now().toString(),
            text: 'Voice message',
            timestamp: new Date(),
            type: 'voice',
            duration,
          });
        }
        return;
      }

      if (!(await started)) return;
      const current = recorderRef.current;
      if (!current) return;
      if (!longEnough) {
        await current.cancel();
        return;
      }
      const audio = await current.stop();
      if (!audio) return;
      onSendMessage({
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        type: 'voice',
        duration: audio.duration || duration,
        attachment: {
          kind: 'audio',
          uri: audio.uri,
          name: audio.name || `voice-${Date.now()}.m4a`,
          mimeType: audio.mimeType,
        },
      });
    },
  };

  const micResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (lockedRef.current) {
          sendTapRef.current = true;
          return;
        }
        recordingHandlers.current.startRecording();
      },
      onPanResponderMove: (_, gesture) => {
        if (lockedRef.current) return;
        slideX.setValue(Math.min(0, gesture.dx));
        lockY.setValue(Math.min(0, gesture.dy));
        // Up (and not mostly sideways): lock hands-free
        if (gesture.dy < LOCK_THRESHOLD && gesture.dx > CANCEL_THRESHOLD / 2) {
          recordingHandlers.current.lock();
        }
      },
      // A locked recording carries on after the finger lifts
      onPanResponderRelease: (_, gesture) => {
        if (sendTapRef.current) {
          sendTapRef.current = false;
          recordingHandlers.current.finishRecording(true);
          return;
        }
        if (lockedRef.current) return;
        recordingHandlers.current.finishRecording(
          gesture.dx > CANCEL_THRESHOLD
        );
      },
      onPanResponderTerminate: () => {
        sendTapRef.current = false;
        if (lockedRef.current) return;
        recordingHandlers.current.finishRecording(false);
      },
    })
  ).current;

  const iconColor = configSecondary;

  return (
    <View>
      <View style={[themeStyles.flexRow, styles.bar, barStyle]}>
        <View style={[themeStyles.flex1, themeStyles.whiteBg, styles.pill]}>
          {isRecording ? (
            <VoiceRecorder
              recording={{ isRecording, duration, amplitude }}
              slideX={slideX}
              cancelThreshold={CANCEL_THRESHOLD}
              locked={locked}
              onDelete={() => recordingHandlers.current.finishRecording(false)}
            />
          ) : (
            <>
              {header}
              <View style={[themeStyles.flexRow, styles.pillRow]}>
                {(emojis || stickers) && (
                  <TouchableOpacity
                    accessibilityLabel={
                      emojiKeyboard.isEmojiMode ? 'Show keyboard' : 'Show emoji'
                    }
                    style={[themeStyles.flexCenter, styles.iconButton]}
                    onPress={emojiKeyboard.toggleEmojiKeyboard}
                    activeOpacity={0.6}>
                    {emojiKeyboard.isEmojiMode ? (
                      <KeyboardSVG
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        color={iconColor}
                      />
                    ) : (
                      <EmojiSVG
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        color={iconColor}
                      />
                    )}
                  </TouchableOpacity>
                )}

                <TextInput
                  ref={inputRef}
                  style={[themeStyles.flex1, styles.textInput]}
                  placeholder={placeholder}
                  placeholderTextColor="#9E9E9E"
                  selectionColor={primaryColor}
                  value={text}
                  onChangeText={setText}
                  onFocus={event => {
                    emojiKeyboard.handleInputFocus();
                    onFocus?.(event);
                  }}
                  onSelectionChange={event => {
                    emojiKeyboard.handleSelectionChange(event);
                    onSelectionChange?.(event);
                  }}
                  multiline
                  maxLength={1000}
                />

                {pickers && (
                  <TouchableOpacity
                    accessibilityLabel="Attach"
                    style={[themeStyles.flexCenter, styles.iconButton]}
                    onPress={emojiKeyboard.toggleAttachMenu}
                    activeOpacity={0.6}>
                    <AttachSVG
                      width={ICON_SIZE}
                      height={ICON_SIZE}
                      color={iconColor}
                    />
                  </TouchableOpacity>
                )}
                {pickers && !hasText && (
                  <TouchableOpacity
                    accessibilityLabel="Camera"
                    style={[themeStyles.flexCenter, styles.iconButton]}
                    onPress={() => runPicker(pickers.openCamera)}
                    activeOpacity={0.6}>
                    <CameraSVG width={22} height={22} color={iconColor} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {hasText ? (
          <TouchableOpacity
            accessibilityLabel="Send"
            style={[
              themeStyles.flexCenter,
              themeStyles.primaryBg,
              styles.actionButton,
            ]}
            onPress={handleSendPress}
            activeOpacity={0.8}>
            <SendSVG
              width={22}
              height={22}
              color="white"
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        ) : voiceButton ? (
          voiceButton
        ) : (
          <View>
            {isRecording && !locked && (
              // Slide up to this to lock the recording
              <Animated.View
                pointerEvents="none"
                style={[
                  themeStyles.flexCenter,
                  styles.lockHint,
                  { transform: [{ translateY: lockY }] },
                ]}>
                <LockSVG width={18} height={18} color={iconColor} />
                <ChevronUpSVG width={18} height={18} color={iconColor} />
              </Animated.View>
            )}
            {/* One view for the whole gesture: it turns into Send once the
                recording is locked, without dropping the touch */}
            <View
              testID="mic-button"
              accessibilityRole="button"
              accessibilityLabel={locked ? 'Send recording' : 'Hold to record'}
              accessibilityHint={
                locked
                  ? undefined
                  : 'Hold to record a voice message, release to send'
              }
              onAccessibilityTap={
                locked
                  ? () => recordingHandlers.current.finishRecording(true)
                  : undefined
              }
              style={[
                themeStyles.flexCenter,
                themeStyles.primaryBg,
                styles.actionButton,
                isRecording && !locked && styles.actionButtonRecording,
              ]}
              {...micResponder.panHandlers}>
              {locked ? (
                <SendSVG
                  width={22}
                  height={22}
                  color="white"
                  style={styles.sendIcon}
                />
              ) : (
                <MicSVG width={ICON_SIZE} height={ICON_SIZE} color="white" />
              )}
            </View>
          </View>
        )}
      </View>

      {showTapHint && (
        <View pointerEvents="none" style={styles.tapHint}>
          <Text style={styles.tapHintText}>
            Hold to record, release to send
          </Text>
        </View>
      )}

      {/* Keyboard / panel space; panels hang from its top edge so they move
          with the input bar */}
      <Reanimated.View
        style={[styles.bottomArea, emojiKeyboard.bottomAreaStyle]}>
        {emojiKeyboard.activePanel === 'search' && (
          <EmojiSearch
            height={SEARCH_BAR_HEIGHT}
            onEmojiSelect={emojiKeyboard.insertEmoji}
            onClose={emojiKeyboard.openEmojiKeyboard}
          />
        )}
        {emojiKeyboard.activePanel === 'attach' && pickers && (
          <AttachmentMenu
            height={emojiKeyboard.panelProps.height}
            bottomInset={emojiKeyboard.panelProps.bottomInset}
            onDocument={fromMenu(pickers.pickDocument)}
            onCamera={fromMenu(pickers.openCamera)}
            onGallery={fromMenu(pickers.openGallery)}
            onAudio={fromMenu(pickers.pickAudio)}
          />
        )}
        {emojiOpens > 0 && (
          <View
            style={emojiKeyboard.activePanel === 'attach' && styles.hidden}
            pointerEvents={emojiActive ? 'auto' : 'none'}>
            <EmojiKeyboard
              {...emojiKeyboard.panelProps}
              refreshKey={emojiOpens}
              onSearch={emojis ? emojiKeyboard.openSearch : undefined}
              onStickerSelect={stickers ? handleStickerSelect : undefined}
              showEmoji={emojis}
              stickerSize={stickerSize}
              stickerColumns={stickerColumns}
            />
          </View>
        )}
      </Reanimated.View>

      {editingImages.length > 0 && (
        <MediaEditor
          images={editingImages}
          initialCaption={text}
          recipientName={recipientName}
          onClose={() => setEditingImages([])}
          onSend={handleEditedImages}
          viewOnceEnabled={viewOnce}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 6,
    // The space below the bar is reserved separately (see bottomArea,
    // sized off the safe-area inset / keyboard / panel height), so an
    // equal bottom padding here would double that clearance on top of it.
    paddingBottom: 0,
    gap: 6,
  },
  pill: {
    borderRadius: 24,
    minHeight: 48,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  pillRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  iconButton: {
    width: 40,
    height: 48,
  },
  textInput: {
    fontSize: 17,
    color: 'black',
    maxHeight: 120,
    paddingTop: 13,
    paddingBottom: 13,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  actionButtonRecording: {
    transform: [{ scale: 1.25 }],
  },
  sendIcon: {
    marginLeft: 3,
  },
  lockHint: {
    position: 'absolute',
    bottom: 64,
    alignSelf: 'center',
    width: 40,
    paddingVertical: 8,
    gap: 2,
    borderRadius: 20,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  tapHint: {
    position: 'absolute',
    right: 12,
    bottom: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  tapHintText: {
    color: 'white',
    fontSize: 13,
  },
  bottomArea: {
    overflow: 'hidden',
  },
  hidden: {
    display: 'none',
  },
});
