import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Animated,
  BackHandler,
  Alert,
  Text,
} from 'react-native';
import {
  InputMode,
  Sticker,
  Message,
  AudioData,
  RecordingState,
} from '../types/inputTypes';
import { UnifiedPanel } from './UnifiedPanel';
import { VoiceRecordingUI } from './VoiceRecordingUI';
import { AttachmentMenu } from './AttachmentMenu';
import { MicButton } from './MicButton';
import { useVoiceRecorder } from '../common/VoiceRecorderContext';
import { useKeyboardManager } from '../hooks/useKeyboardManager';
import {
  EmojiIcon,
  KeyboardIcon,
  AttachIcon,
  CameraIcon,
  SendIcon,
} from '../svg/svgIcons';

interface Props {
  onSendMessage: (message: Message) => void;
  placeholder?: string;
  maxLength?: number;
}

export const ChatInput: React.FC<Props> = ({
  onSendMessage,
  placeholder = 'Message',
  maxLength = 4096,
}) => {
  const [text, setText] = useState('');
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);

  const inputRef = useRef<TextInput>(null);

  const {
    isKeyboardVisible,
    isPanelOpen,
    panelAnim,
    togglePanel,
    closePanel,
    onInputFocus,
  } = useKeyboardManager();

  const {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    handleSendVoiceMessage,
  } = useVoiceRecorder();

  const isActivelyRecording =
    recordingState === RecordingState.RECORDING ||
    recordingState === RecordingState.PAUSED;

  // ── Android back-button ──────────────────────────────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (attachMenuVisible) {
        setAttachMenuVisible(false);
        return true;
      }
      if (isPanelOpen) {
        closePanel();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [attachMenuVisible, isPanelOpen, closePanel]);

  // ── Panel / keyboard orchestration ──────────────────────────────────────
  const handleEmojiButtonPress = useCallback(() => {
    if (isPanelOpen) {
      closePanel();
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      togglePanel();
    }
  }, [isPanelOpen, closePanel, togglePanel]);

  const handleTextFocus = useCallback(() => {
    onInputFocus();
    setAttachMenuVisible(false);
  }, [onInputFocus]);

  // ── Text editing ─────────────────────────────────────────────────────────
  const handleEmojiSelect = useCallback((emoji: string) => {
    setText(prev => prev + emoji);
  }, []);

  const handleBackspace = useCallback(() => {
    setText(prev => {
      if (!prev) return prev;
      return Array.from(prev).slice(0, -1).join('');
    });
  }, []);

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSendText = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage({
      id: Date.now().toString(),
      text: trimmed,
      timestamp: new Date(),
      type: 'text',
    });
    setText('');
  }, [text, onSendMessage]);

  const handleStickerSelect = useCallback(
    (sticker: Sticker) => {
      onSendMessage({
        id: Date.now().toString(),
        text: `[Sticker: ${sticker.id}]`,
        timestamp: new Date(),
        type: 'image',
      });
      closePanel();
    },
    [onSendMessage, closePanel]
  );

  // ── Voice ─────────────────────────────────────────────────────────────────
  const handleVoicePressIn = useCallback(async () => {
    try {
      closePanel();
      Keyboard.dismiss();
      await startRecording();
    } catch (err) {
      console.error('[ChatInput] startRecording:', err);
    }
  }, [closePanel, startRecording]);

  const handleVoicePressOut = useCallback(async () => {
    if (recordingState === RecordingState.RECORDING) {
      const data = await stopRecording();
      if (data) {
        await handleSendVoiceMessage(data);
        onSendMessage({
          id: Date.now().toString(),
          text: 'Voice message',
          timestamp: new Date(),
          type: 'voice',
          duration: data.duration,
          uri: data.uri,
        });
      }
    }
  }, [recordingState, stopRecording, handleSendVoiceMessage, onSendMessage]);

  const handleVoiceComplete = useCallback(
    async (audioData: AudioData) => {
      await handleSendVoiceMessage(audioData);
      onSendMessage({
        id: Date.now().toString(),
        text: 'Voice message',
        timestamp: new Date(),
        type: 'voice',
        duration: audioData.duration,
        uri: audioData.uri,
      });
    },
    [handleSendVoiceMessage, onSendMessage]
  );

  const handleVoiceCancel = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  // ── Attachment handlers ───────────────────────────────────────────────────
  const handleAttachPress = useCallback(() => {
    Keyboard.dismiss();
    closePanel();
    setTimeout(() => setAttachMenuVisible(true), 100);
  }, [closePanel]);

  const attachHandler = (name: string) => () =>
    Alert.alert(name, `${name} picker coming soon`);

  // ── Render ────────────────────────────────────────────────────────────────
  const hasText = text.trim().length > 0;
  const showEmojiIcon = isPanelOpen;

  return (
    <View style={styles.root}>
      {/* ── Voice Recording overlay ── */}
      {isActivelyRecording && (
        <VoiceRecordingUI
          onComplete={handleVoiceComplete}
          onCancel={handleVoiceCancel}
        />
      )}

      {/* ── Input row: pill bubble + action button side by side ── */}
      {!isActivelyRecording && (
        <View style={styles.inputRow}>
          {/* Pill-shaped input bar */}
          <View style={styles.inputBar}>
            {/* Left: emoji / keyboard toggle */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleEmojiButtonPress}
              activeOpacity={0.6}>
              {showEmojiIcon ? (
                <KeyboardIcon size={24} color="#8696A0" />
              ) : (
                <EmojiIcon size={24} color="#8696A0" />
              )}
            </TouchableOpacity>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor="#8696A0"
              value={text}
              onChangeText={setText}
              onFocus={handleTextFocus}
              multiline
              maxLength={maxLength}
            />

            {/* Attachment icons — only shown when no text typed */}
            {!hasText && (
              <View style={styles.attachRow}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={handleAttachPress}
                  activeOpacity={0.6}>
                  <AttachIcon size={24} color="#8696A0" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={attachHandler('Camera')}
                  activeOpacity={0.6}>
                  <CameraIcon size={24} color="#8696A0" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Action button: send or mic — always visible ── */}
          <View style={styles.actionWrap}>
            {hasText ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.sendBtn]}
                onPress={handleSendText}
                activeOpacity={0.7}>
                <SendIcon size={20} fill="#fff" />
              </TouchableOpacity>
            ) : (
              <MicButton
                onPressIn={handleVoicePressIn}
                onPressOut={handleVoicePressOut}
                isRecording={false}
              />
            )}
          </View>
        </View>
      )}

      {/* ── Emoji / GIF / Sticker panel ── */}
      {!isActivelyRecording && (
        <Animated.View style={[styles.panel, { height: panelAnim }]}>
          {isPanelOpen && (
            <UnifiedPanel
              onEmojiSelect={handleEmojiSelect}
              onStickerSelect={handleStickerSelect}
              onBackspace={handleBackspace}
              hasText={hasText}
              onClose={closePanel}
            />
          )}
        </Animated.View>
      )}

      {/* ── Attachment sheet ── */}
      <AttachmentMenu
        visible={attachMenuVisible}
        onClose={() => setAttachMenuVisible(false)}
        onDocumentPress={attachHandler('Document')}
        onCameraPress={attachHandler('Camera')}
        onGalleryPress={attachHandler('Gallery')}
        onAudioPress={attachHandler('Audio')}
        onLocationPress={attachHandler('Location')}
        onContactPress={attachHandler('Contact')}
        onPollPress={attachHandler('Poll')}
        onEventPress={attachHandler('Event')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#0B141A',
  },

  // Outer row: input bubble + action button sit side by side
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },

  // The pill-shaped bubble — flex: 1 so it fills remaining space
  inputBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // ← was 'flex-end'
    backgroundColor: '#1F2C34',
    borderRadius: 24,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 48,
    maxHeight: 120,
  },

  iconBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // inputBar: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   alignItems: 'flex-end',
  //   backgroundColor: '#1F2C34',
  //   borderRadius: 24,
  //   paddingLeft: 4,
  //   paddingRight: 4,
  //   minHeight: 48,
  //   maxHeight: 120,
  // },

  // iconBtn: {
  //   width: 42,
  //   height: 42,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#E9EDEF',
    paddingVertical: 10, // ← uniform vertical padding
    paddingHorizontal: 4,
    maxHeight: 100,
    textAlignVertical: 'center', // ← Android: keeps caret centred when single-line
  },

  // textInput: {
  //   flex: 1,
  //   fontSize: 16,
  //   color: '#E9EDEF',
  //   paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  //   paddingHorizontal: 4,
  //   maxHeight: 100,
  // },

  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Inline action button — no longer absolute positioned
  actionWrap: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end', // ← stays pinned to bottom when input grows tall
  },

  // actionWrap: {
  //   width: 48,
  //   height: 48,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },

  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
  },

  sendBtn: {
    backgroundColor: '#00A884',
  },

  panel: {
    overflow: 'hidden',
    backgroundColor: '#1F2C34',
  },
});
