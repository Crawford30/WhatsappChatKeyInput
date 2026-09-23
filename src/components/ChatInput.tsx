import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
import type { Message, Sticker } from '../types/inputTypes';
import { EmojiKeyboard } from './EmojiKeyboard';
import { VoiceRecorder } from './VoiceRecorder';

const CANCEL_THRESHOLD = -120;
const ICON_SIZE = 24;

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
  onAttachPress?: () => void;
  onCameraPress?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachPress,
  onCameraPress,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const hasText = text.trim().length > 0;

  const emojiKeyboard = useEmojiKeyboard({
    inputRef,
    value: text,
    onChangeText: setText,
  });

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
  }, [hasText, text, onSendMessage]);

  const handleStickerSelect = useCallback(
    (sticker: Sticker) => {
      onSendMessage({
        id: Date.now().toString(),
        text: `[Sticker: ${sticker.id}]`,
        timestamp: new Date(),
        type: 'image',
      });
    },
    [onSendMessage]
  );

  // Hold the mic to record, release to send, slide left to cancel. The
  // responder is created once, so it reads the latest handlers from a ref.
  const slideX = useRef(new Animated.Value(0)).current;
  const recordingHandlers = useRef({
    startRecording,
    finishRecording: (_send: boolean) => {},
  });
  recordingHandlers.current = {
    startRecording,
    finishRecording: (send: boolean) => {
      if (send && duration > 0) {
        onSendMessage({
          id: Date.now().toString(),
          text: 'Voice message',
          timestamp: new Date(),
          type: 'voice',
          duration,
        });
      }
      if (send) stopRecording();
      else cancelRecording();
      slideX.setValue(0);
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
      <View style={[themeStyles.flexRow, styles.bar]}>
        <View style={[themeStyles.flex1, themeStyles.whiteBg, styles.pill]}>
          {isRecording ? (
            <VoiceRecorder
              recording={{ isRecording, duration, amplitude }}
              slideX={slideX}
              cancelThreshold={CANCEL_THRESHOLD}
            />
          ) : (
            <View style={[themeStyles.flexRow, styles.pillRow]}>
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

              <TextInput
                ref={inputRef}
                style={[themeStyles.flex1, styles.textInput]}
                placeholder="Message"
                placeholderTextColor="#9E9E9E"
                selectionColor={primaryColor}
                value={text}
                onChangeText={setText}
                onFocus={emojiKeyboard.handleInputFocus}
                onSelectionChange={emojiKeyboard.handleSelectionChange}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                accessibilityLabel="Attach"
                style={[themeStyles.flexCenter, styles.iconButton]}
                onPress={onAttachPress}
                activeOpacity={0.6}>
                <AttachSVG
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                  color={iconColor}
                />
              </TouchableOpacity>
              {!hasText && (
                <TouchableOpacity
                  accessibilityLabel="Camera"
                  style={[themeStyles.flexCenter, styles.iconButton]}
                  onPress={onCameraPress}
                  activeOpacity={0.6}>
                  <CameraSVG width={22} height={22} color={iconColor} />
                </TouchableOpacity>
              )}
            </View>
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

      <EmojiKeyboard
        {...emojiKeyboard.panelProps}
        onStickerSelect={handleStickerSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    paddingHorizontal: 6,
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
});
