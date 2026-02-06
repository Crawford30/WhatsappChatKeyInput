import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Animated,
  BackHandler,
  Alert,
} from 'react-native';
import { InputMode } from '../types/inputTypes';
import type { Sticker, Message } from '../types/inputTypes';
import { UnifiedPanel } from './UnifiedPanel';
import { VoiceRecorder } from './VoiceRecorder';
import { AttachmentMenu } from './AttachmentMenu';

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [text, setText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState({
    isRecording: false,
    duration: 0,
    amplitude: [] as number[],
  });

  const inputRef = useRef<TextInput>(null);
  const panelHeightAnim = useRef(new Animated.Value(0)).current;
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        if (inputMode === InputMode.PANEL) {
          hidePanel();
        }
        if (attachmentMenuVisible) {
          setAttachmentMenuVisible(false);
        }
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [inputMode, hidePanel, attachmentMenuVisible]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (attachmentMenuVisible) {
          setAttachmentMenuVisible(false);
          return true;
        }
        if (inputMode === InputMode.PANEL) {
          hidePanel();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [inputMode, hidePanel, attachmentMenuVisible]);

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
      hidePanel();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
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
  }, []);

  const handleBackspace = useCallback(() => {
    setText(prev => {
      if (!prev) return prev;
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

  const handleAttachmentPress = useCallback(() => {
    Keyboard.dismiss();
    if (inputMode === InputMode.PANEL) {
      hidePanel();
    }
    setTimeout(() => {
      setAttachmentMenuVisible(true);
    }, 100);
  }, [inputMode, hidePanel]);

  const handleCloseAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible(false);
  }, []);

  const handleDocumentPress = useCallback(() => {
    Alert.alert('Document', 'Document picker will open here');
  }, []);

  const handleCameraPress = useCallback(() => {
    Alert.alert('Camera', 'Camera will open here');
  }, []);

  const handleGalleryPress = useCallback(() => {
    Alert.alert('Gallery', 'Gallery picker will open here');
  }, []);

  const handleAudioPress = useCallback(() => {
    Alert.alert('Audio', 'Audio picker will open here');
  }, []);

  const handleLocationPress = useCallback(() => {
    Alert.alert('Location', 'Location picker will open here');
  }, []);

  const handleContactPress = useCallback(() => {
    Alert.alert('Contact', 'Contact picker will open here');
  }, []);

  const handlePollPress = useCallback(() => {
    Alert.alert('Poll', 'Poll creator will open here');
  }, []);

  const handleEventPress = useCallback(() => {
    Alert.alert('Event', 'Event creator will open here');
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
            {/* Emoji/Panel Toggle Button */}
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
              placeholderTextColor="#8696A0"
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
                  onPress={handleAttachmentPress}
                  activeOpacity={0.6}>
                  <Text style={styles.attachIcon}>📎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={handleCameraPress}
                  activeOpacity={0.6}>
                  <Text style={styles.attachIcon}>📷</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Send or Voice Button */}
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
              <Text style={styles.actionIcon}>🎤</Text>
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

      {/* Attachment Menu */}
      <AttachmentMenu
        visible={attachmentMenuVisible}
        onClose={handleCloseAttachmentMenu}
        onDocumentPress={handleDocumentPress}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
        onAudioPress={handleAudioPress}
        onLocationPress={handleLocationPress}
        onContactPress={handleContactPress}
        onPollPress={handlePollPress}
        onEventPress={handleEventPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B141A',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#1F2C34',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A3942',
    borderRadius: 22,
    paddingLeft: 4,
    paddingRight: 4,
    marginRight: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#E9EDEF',
    maxHeight: 100,
  },
  attachmentButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 22,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A884',
  },
  sendButton: {
    backgroundColor: '#00A884',
  },
  actionIcon: {
    fontSize: 24,
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  panel: {
    overflow: 'hidden',
    backgroundColor: '#1F2C34',
  },
});
