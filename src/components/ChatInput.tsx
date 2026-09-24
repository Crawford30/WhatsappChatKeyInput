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
import { EmojiSVG } from '../assets/svg/EmojiSVG';
import { KeyboardSVG } from '../assets/svg/KeyboardSVG';
import { MicSVG } from '../assets/svg/MicSVG';
import { SendSVG } from '../assets/svg/SendSVG';
import { useEmojiKeyboard } from '../hooks/useEmojiKeyboard';
import { useVoiceRecording } from '../hooks/useInputHook';
import type {
  Attachment,
  AttachmentPickers,
  Message,
  Sticker,
  VoiceRecorderAdapter,
} from '../types/inputTypes';
import { AttachmentMenu } from './AttachmentMenu';
import { EditedImage, MediaEditor } from './media/MediaEditor';
import { EmojiKeyboard } from './EmojiKeyboard';
import { VoiceRecorder } from './VoiceRecorder';

const CANCEL_THRESHOLD = -120;
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
  /** Merged over the bar's default style (12 sides, 6 top and bottom), e.g. `{ paddingHorizontal: 6 }` */
  barStyle?: StyleProp<ViewStyle>;
  /** Least space under the bar when the keyboard and panels are closed. Wins over the safe-area inset only when larger (default 6) */
  minBottomInset?: number;
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
  emojis = true,
  stickerSize,
  stickerColumns,
  barStyle,
  minBottomInset,
}) => {
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
  // The app's recorder can change between renders (its callbacks often
  // depend on its own state), so always call the latest one
  const recorderRef = useRef(recorder);
  recorderRef.current = recorder;
  // Resolves to whether the real recorder actually started
  const recorderStarted = useRef<Promise<boolean> | null>(null);

  const recordingHandlers = useRef({
    startRecording: () => {},
    finishRecording: (_send: boolean) => {},
  });
  recordingHandlers.current = {
    startRecording: () => {
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
      slideX.setValue(0);
      // The on-screen timer ticks each second; under 1s counts as a tap
      const longEnough = send && duration > 0;
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
      onPanResponderGrant: () => recordingHandlers.current.startRecording(),
      onPanResponderMove: (_, gesture) =>
        slideX.setValue(Math.min(0, gesture.dx)),
      onPanResponderRelease: (_, gesture) =>
        recordingHandlers.current.finishRecording(
          gesture.dx > CANCEL_THRESHOLD
        ),
      onPanResponderTerminate: () =>
        recordingHandlers.current.finishRecording(false),
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
          <View
            accessibilityLabel="Hold to record"
            style={[
              themeStyles.flexCenter,
              themeStyles.primaryBg,
              styles.actionButton,
              isRecording && styles.actionButtonRecording,
            ]}
            {...micResponder.panHandlers}>
            <MicSVG width={ICON_SIZE} height={ICON_SIZE} color="white" />
          </View>
        )}
      </View>

      {/* Keyboard / panel space; panels hang from its top edge so they move
          with the input bar */}
      <Reanimated.View
        style={[styles.bottomArea, emojiKeyboard.bottomAreaStyle]}>
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  bottomArea: {
    overflow: 'hidden',
  },
  hidden: {
    display: 'none',
  },
});
