import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { InputMode } from '../types/inputTypes';
import { Sticker, Message } from '../types/inputTypes';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [text, setText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState({
    isRecording: false,
    duration: 0,
    amplitude: [] as number[],
  });

  const inputRef = useRef<TextInput>(null);
  const panelHeightAnim = useRef(new Animated.Value(0)).current;
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Voice recording timer
  useEffect(() => {
    if (voiceRecording.isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setVoiceRecording(prev => ({
          ...prev,
          duration: prev.duration + 1,
          amplitude: [...prev.amplitude.slice(-20), Math.random() * 0.8 + 0.2],
        }));
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [voiceRecording.isRecording]);

  const showPanel = useCallback(
    (mode: InputMode) => {
      Animated.spring(panelHeightAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start();
      setInputMode(mode);
    },
    [panelHeightAnim]
  );

  const hidePanel = useCallback(() => {
    Animated.timing(panelHeightAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setInputMode(InputMode.TEXT);
    });
  }, [panelHeightAnim]);

  const handleEmojiPress = useCallback(() => {
    if (inputMode === InputMode.EMOJI) {
      // Close emoji panel
      hidePanel();
      inputRef.current?.focus();
    } else {
      // Open emoji panel
      Keyboard.dismiss();
      setTimeout(() => showPanel(InputMode.EMOJI), 100);
    }
  }, [inputMode, hidePanel, showPanel]);

  const handleStickerPress = useCallback(() => {
    if (inputMode === InputMode.STICKER) {
      // Close sticker panel
      hidePanel();
      inputRef.current?.focus();
    } else {
      // Open sticker panel
      Keyboard.dismiss();
      setTimeout(() => showPanel(InputMode.STICKER), 100);
    }
  }, [inputMode, hidePanel, showPanel]);

  const handleTextFocus = useCallback(() => {
    if (inputMode !== InputMode.TEXT) {
      hidePanel();
    }
  }, [inputMode, hidePanel]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText(prev => prev + emoji);
  }, []);

  const handleStickerSelect = useCallback(
    (sticker: Sticker) => {
      onSendMessage({
        id: Date.now().toString(),
        text: `[Sticker: ${sticker.id}]`,
        timestamp: new Date(),
        type: 'image',
      });
      hidePanel();
    },
    [onSendMessage, hidePanel]
  );

  const handleSendPress = useCallback(() => {
    if (text.trim()) {
      onSendMessage({
        id: Date.now().toString(),
        text: text.trim(),
        timestamp: new Date(),
        type: 'text',
      });
      setText('');
    }
  }, [text, onSendMessage]);

  const handleVoiceLongPress = useCallback(() => {
    setVoiceRecording({
      isRecording: true,
      duration: 0,
      amplitude: [],
    });
  }, []);

  const handleVoiceRelease = useCallback(() => {
    if (voiceRecording.isRecording && voiceRecording.duration > 0) {
      // Send voice message
      onSendMessage({
        id: Date.now().toString(),
        text: 'Voice message',
        timestamp: new Date(),
        type: 'voice',
        duration: voiceRecording.duration,
      });
    }
    setVoiceRecording({
      isRecording: false,
      duration: 0,
      amplitude: [],
    });
  }, [voiceRecording, onSendMessage]);

  const handleVoiceCancel = useCallback(() => {
    setVoiceRecording({
      isRecording: false,
      duration: 0,
      amplitude: [],
    });
  }, []);

  const panelHeight = panelHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 350],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.container}>
        {/* Voice Recording Overlay */}
        {voiceRecording.isRecording && (
          <VoiceRecorder
            recording={voiceRecording}
            onCancel={handleVoiceCancel}
            onSend={handleVoiceRelease}
          />
        )}

        {/* Input Bar */}
        {!voiceRecording.isRecording && (
          <View style={styles.inputBar}>
            {/* Emoji Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleEmojiPress}
              activeOpacity={0.6}>
              <Text style={styles.iconText}>
                {inputMode === InputMode.EMOJI ? '⌨️' : '😊'}
              </Text>
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Message"
                placeholderTextColor="#999"
                value={text}
                onChangeText={setText}
                onFocus={handleTextFocus}
                multiline
                maxLength={1000}
              />

              {/* Attachment Buttons */}
              {text.length === 0 && (
                <View style={styles.attachmentButtons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleStickerPress}
                    activeOpacity={0.6}>
                    <Text style={styles.iconText}>
                      {inputMode === InputMode.STICKER ? '💬' : '📄'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    activeOpacity={0.6}>
                    <Text style={styles.iconText}>📷</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Send or Voice Button */}
            {text.length > 0 ? (
              <TouchableOpacity
                style={[styles.iconButton, styles.sendButton]}
                onPress={handleSendPress}
                activeOpacity={0.6}>
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.iconButton}
                onLongPress={handleVoiceLongPress}
                onPressOut={handleVoiceRelease}
                activeOpacity={0.6}
                delayLongPress={100}>
                <Text style={styles.iconText}>🎤</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Emoji/Sticker Panel */}
        {!keyboardVisible && (
          <Animated.View style={[styles.panel, { height: panelHeight }]}>
            {inputMode === InputMode.EMOJI && (
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            )}
            {inputMode === InputMode.STICKER && (
              <StickerPicker onStickerSelect={handleStickerSelect} />
            )}
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingRight: 8,
    color: '#000',
  },
  attachmentButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 20,
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  panel: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
