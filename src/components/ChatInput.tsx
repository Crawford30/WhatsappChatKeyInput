import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputMode, PanelType, Message } from '../types/inputTypes';
import { EmojiPanel } from './EmojiPanel';
import { VoiceRecordingView } from './VoiceRecorderView';
import { useVoiceRecorder } from '../common/VoiceRecorderContext';
import { RecordingState } from '../common/VoiceRecorderService';
import { requestAudioPermission } from '../utils/fileUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_CANCEL_THRESHOLD = 120;
const LOCK_SLIDE_THRESHOLD = 80;

interface ChatInputProps {
  onSendMessage: (message: Message) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [activePanelType, setActivePanelType] = useState<PanelType>(
    PanelType.EMOJI
  );
  const [messageText, setMessageText] = useState('');
  const [showSendButton, setShowSendButton] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  // Voice recording states
  const [isLocked, setIsLocked] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const lockSlideAnim = useRef(new Animated.Value(0)).current;
  const micScaleAnim = useRef(new Animated.Value(1)).current;

  const {
    recordingState,
    recordTime,
    isRecorderVisible,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    hideRecorder,
    handleSendVoiceMessage,
  } = useVoiceRecorder();

  // Pan responder for mic button
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: async () => {
        if (isLocked) return;

        // Check permission and start recording
        const hasPermission = await requestAudioPermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Microphone permission is required to record audio.'
          );
          return;
        }

        Vibration.vibrate(50);

        // Animate mic button
        Animated.spring(micScaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();

        // Start recording
        try {
          await startRecording();
        } catch (error) {
          console.error('Failed to start recording:', error);
        }
      },

      onPanResponderMove: (_, gestureState) => {
        if (isLocked) return;

        const { dx, dy } = gestureState;

        // Slide left to cancel
        if (dx < 0) {
          const slideValue = Math.min(Math.abs(dx), SLIDE_CANCEL_THRESHOLD);
          slideAnim.setValue(-slideValue);
        }

        // Slide up to lock
        if (dy < 0) {
          const lockValue = Math.min(Math.abs(dy), LOCK_SLIDE_THRESHOLD);
          lockSlideAnim.setValue(-lockValue);
        }
      },

      onPanResponderRelease: async (_, gestureState) => {
        if (isLocked) return;

        const { dx, dy } = gestureState;

        // Reset mic scale
        Animated.spring(micScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Check if slid up enough to lock
        if (Math.abs(dy) >= LOCK_SLIDE_THRESHOLD) {
          setIsLocked(true);
          Vibration.vibrate(50);

          // Reset animations
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(lockSlideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();

          return;
        }

        // Check if slid left to cancel
        if (Math.abs(dx) >= SLIDE_CANCEL_THRESHOLD) {
          await handleCancelRecording();
          return;
        }

        // Send recording if not cancelled
        await handleStopAndSend();

        // Reset animations
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(lockSlideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },

      onPanResponderTerminate: async () => {
        if (!isLocked) {
          await handleCancelRecording();
        }
      },
    })
  ).current;

  const handleCancelRecording = async () => {
    setIsLocked(false);
    await cancelRecording();
    slideAnim.setValue(0);
    lockSlideAnim.setValue(0);
    Animated.spring(micScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleStopAndSend = async () => {
    try {
      const audioData = await stopRecording();
      if (audioData) {
        await handleSendVoiceMessage(audioData);

        // Add voice message to chat
        const voiceMessage: Message = {
          id: Date.now().toString(),
          text: '',
          timestamp: new Date(),
          type: 'voice',
          duration: Math.round(audioData.duration),
        };
        onSendMessage(voiceMessage);
      }
      setIsLocked(false);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  const handlePauseToggle = async () => {
    if (recordingState === RecordingState.RECORDING) {
      await pauseRecording();
    } else if (recordingState === RecordingState.PAUSED) {
      await resumeRecording();
    }
  };

  const handleDeleteRecording = async () => {
    await handleCancelRecording();
  };

  const handleSendRecording = async () => {
    await handleStopAndSend();
  };

  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);
    setShowSendButton(text.trim().length > 0);
  }, []);

  const handleSendPress = useCallback(() => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        timestamp: new Date(),
        type: 'text',
      };
      onSendMessage(newMessage);
      setMessageText('');
      setShowSendButton(false);
    }
  }, [messageText, onSendMessage]);

  const handleEmojiPress = useCallback(() => {
    Keyboard.dismiss();
    setInputMode(prev =>
      prev === InputMode.PANEL && activePanelType === PanelType.EMOJI
        ? InputMode.TEXT
        : InputMode.PANEL
    );
    setActivePanelType(PanelType.EMOJI);
  }, [activePanelType]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowSendButton(true);
  }, []);

  const handleAttachPress = useCallback(() => {
    Alert.alert('Attach', 'Attachment options');
  }, []);

  const handleCameraPress = useCallback(() => {
    Alert.alert('Camera', 'Camera functionality');
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (inputMode === InputMode.PANEL) {
          setInputMode(InputMode.TEXT);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [inputMode]);

  const isPanelVisible = inputMode === InputMode.PANEL;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={styles.container}>
        {/* Voice Recording View - Shown when recording */}
        {isRecorderVisible && (
          <VoiceRecordingView
            recordTime={recordTime}
            isLocked={isLocked}
            isPaused={recordingState === RecordingState.PAUSED}
            slideAnim={slideAnim}
            lockSlideAnim={lockSlideAnim}
            onPause={handlePauseToggle}
            onDelete={handleDeleteRecording}
            onSend={handleSendRecording}
          />
        )}

        {/* Main Input Container - Hidden when recording */}
        {!isRecorderVisible && (
          <View style={styles.inputContainer}>
            {/* Text Input */}
            <View style={styles.textInputContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleEmojiPress}>
                <EmojiIcon />
              </TouchableOpacity>

              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Message"
                placeholderTextColor="#8696A0"
                value={messageText}
                onChangeText={handleTextChange}
                multiline
                maxLength={1000}
              />

              {!showSendButton && (
                <>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleAttachPress}>
                    <AttachIcon />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleCameraPress}>
                    <CameraIcon />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Send/Mic Button */}
            {showSendButton ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendPress}>
                <SendIcon />
              </TouchableOpacity>
            ) : (
              <Animated.View
                style={[
                  styles.micButton,
                  {
                    transform: [{ scale: micScaleAnim }],
                  },
                ]}
                {...panResponder.panHandlers}>
                <MicIcon />
              </Animated.View>
            )}
          </View>
        )}

        {/* Emoji Panel */}
        {isPanelVisible && activePanelType === PanelType.EMOJI && (
          <EmojiPanel onEmojiSelect={handleEmojiSelect} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// Icon Components
const EmojiIcon = () => (
  <View style={styles.icon}>
    <View style={styles.emojiIcon}>
      <View style={styles.emojiCircle} />
      <View style={styles.emojiMouth} />
    </View>
  </View>
);

const AttachIcon = () => (
  <View style={styles.icon}>
    <View style={styles.attachIcon} />
  </View>
);

const CameraIcon = () => (
  <View style={styles.icon}>
    <View style={styles.cameraBody} />
    <View style={styles.cameraLens} />
  </View>
);

const SendIcon = () => (
  <View style={styles.sendIcon}>
    <View style={styles.sendArrow} />
  </View>
);

const MicIcon = () => (
  <View style={styles.micIconContainer}>
    <View style={styles.micBody} />
    <View style={styles.micBottom} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B141A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#0B141A',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2C33',
    borderRadius: 24,
    paddingHorizontal: 8,
    minHeight: 48,
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: '#E9EDEF',
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Icon styles
  icon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  emojiCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8696A0',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  emojiMouth: {
    width: 10,
    height: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#8696A0',
    position: 'absolute',
    bottom: 6,
    left: 7,
  },
  attachIcon: {
    width: 18,
    height: 18,
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: '#8696A0',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  cameraBody: {
    width: 20,
    height: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8696A0',
    borderRadius: 4,
  },
  cameraLens: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8696A0',
    position: 'absolute',
  },
  sendIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  micIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBody: {
    width: 10,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  micBottom: {
    width: 14,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
    marginTop: 2,
  },
});
