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
  BackHandler,
} from 'react-native';
import { InputMode } from '../types/inputTypes';
import type { Sticker, Message } from '../types/inputTypes';
import { UnifiedPanel } from './UnifiedPanel';
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

  // Define these callbacks BEFORE the useEffect hooks that use them
  const showPanel = useCallback(() => {
    Animated.spring(panelHeightAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
    setInputMode(InputMode.PANEL);
  }, [panelHeightAnim]);

  const hidePanel = useCallback(() => {
    Animated.timing(panelHeightAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setInputMode(InputMode.TEXT);
    });
  }, [panelHeightAnim]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Hide panel when keyboard shows
        if (inputMode === InputMode.PANEL) {
          hidePanel();
        }
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // Also hide panel when keyboard is dismissed (Android back button)
        if (inputMode === InputMode.PANEL) {
          hidePanel();
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [inputMode, hidePanel]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (inputMode === InputMode.PANEL) {
          hidePanel();
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      }
    );

    return () => backHandler.remove();
  }, [inputMode, hidePanel]);

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

  const handlePanelToggle = useCallback(() => {
    if (inputMode === InputMode.PANEL) {
      // Close panel and focus input
      hidePanel();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Open panel
      Keyboard.dismiss();
      setTimeout(() => showPanel(), 100);
    }
  }, [inputMode, hidePanel, showPanel]);

  const handleTextFocus = useCallback(() => {
    if (inputMode === InputMode.PANEL) {
      hidePanel();
    }
  }, [inputMode, hidePanel]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText(prev => prev + emoji);
    // Keep panel open after selecting emoji
  }, []);

  const handleBackspace = useCallback(() => {
    setText(prev => {
      if (!prev) return prev;

      // Handle emoji and multi-byte characters properly
      // Use Array.from to handle Unicode properly
      const chars = Array.from(prev);
      return chars.slice(0, -1).join('');
    });
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
          {/* Text Input Wrapper */}
          <View style={styles.inputWrapper}>
            {/* Emoji/Panel Toggle Button - Inside input on left */}
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={handlePanelToggle}
              activeOpacity={0.6}>
              <Text style={styles.emojiIcon}>
                {inputMode === InputMode.PANEL ? '⌨️' : '😊'}
              </Text>
            </TouchableOpacity>

            {/* Text Input */}
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

            {/* Attachment Buttons - only show when no text */}
            {text.length === 0 && (
              <View style={styles.attachmentButtons}>
                <TouchableOpacity
                  style={styles.attachButton}
                  activeOpacity={0.6}>
                  <Text style={styles.attachIcon}>📎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.attachButton}
                  activeOpacity={0.6}>
                  <Text style={styles.attachIcon}>📷</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Send or Voice Button - Outside input on right */}
          {text.length > 0 ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.sendButton]}
              onPress={handleSendPress}
              activeOpacity={0.6}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onLongPress={handleVoiceLongPress}
              onPressOut={handleVoiceRelease}
              activeOpacity={0.6}
              delayLongPress={100}>
              <Text style={styles.voiceIcon}>🎤</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Unified Panel (Emoji/GIF/Sticker) */}
      {!keyboardVisible && (
        <Animated.View style={[styles.panel, { height: panelHeight }]}>
          {inputMode === InputMode.PANEL && (
            <UnifiedPanel
              onEmojiSelect={handleEmojiSelect}
              onStickerSelect={handleStickerSelect}
              onBackspace={handleBackspace}
              hasText={text.length > 0}
              onClose={hidePanel}
            />
          )}
        </Animated.View>
      )}
    </View>
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
    paddingLeft: 4,
    paddingRight: 12,
    minHeight: 40,
    maxHeight: 100,
  },
  emojiButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  emojiIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    color: '#000',
  },
  attachmentButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  attachButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  attachIcon: {
    fontSize: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: -2,
  },
  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 22,
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  voiceIcon: {
    fontSize: 24,
  },
  panel: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
