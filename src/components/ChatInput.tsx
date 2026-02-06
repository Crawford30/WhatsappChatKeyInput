import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Text,
} from 'react-native';
import { Colors, Spacing, FontSizes } from '../Helpers/constants';

// If you install react-native-vector-icons, uncomment this:
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WhatsAppChatInputProps {
  onSendMessage: (message: string) => void;
  onSendVoice: (audioUri: string) => void;
  onOpenAttachments: () => void;
  onOpenEmoji: () => void;
  onOpenCamera: () => void;
  onOpenStickers?: () => void;
  placeholder?: string;
}

// Simple icon component using emoji fallback
const SimpleIcon: React.FC<{ name: string; size: number; color?: string }> = ({
  name,
  size,
  color = Colors.textSecondary,
}) => {
  const iconMap: { [key: string]: string } = {
    'emoticon-happy-outline': '😊',
    paperclip: '📎',
    camera: '📷',
    send: '➤',
    microphone: '🎤',
    'sticker-emoji': '😀',
  };

  // If you have react-native-vector-icons installed, you can replace this
  // with: return <Icon name={name} size={size} color={color} />;

  return (
    <Text style={{ fontSize: size * 0.8, color }}>{iconMap[name] || '•'}</Text>
  );
};

export const WhatsAppChatInput: React.FC<WhatsAppChatInputProps> = ({
  onSendMessage,
  onSendVoice,
  onOpenAttachments,
  onOpenEmoji,
  onOpenCamera,
  onOpenStickers,
  placeholder = 'Message',
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSendVoice('audio-uri-placeholder');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Emoji Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenEmoji}
          activeOpacity={0.7}>
          <SimpleIcon
            name="emoticon-happy-outline"
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Text Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={1000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Right side buttons */}
        {!message && (
          <>
            {/* Attachment Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenAttachments}
              activeOpacity={0.7}>
              <SimpleIcon
                name="paperclip"
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Camera Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenCamera}
              activeOpacity={0.7}>
              <SimpleIcon
                name="camera"
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Send/Voice Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          message ? styles.sendButtonActive : styles.voiceButton,
        ]}
        onPress={message ? handleSend : undefined}
        onPressIn={!message ? handleStartRecording : undefined}
        onPressOut={!message ? handleStopRecording : undefined}
        activeOpacity={0.8}>
        <View style={styles.sendButtonInner}>
          {message ? (
            <SimpleIcon name="send" size={20} color="#FFFFFF" />
          ) : (
            <SimpleIcon name="microphone" size={24} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.inputBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    minHeight: 48,
    maxHeight: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  input: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
    maxHeight: 100,
    ...Platform.select({
      ios: {
        paddingTop: Spacing.sm,
      },
    }),
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  voiceButton: {
    backgroundColor: Colors.primary,
  },
  sendButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// import React, { useState, useRef } from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Keyboard,
//   Animated,
//   Platform,
// } from 'react-native';
// import { Colors, Spacing, BorderRadius, FontSizes } from '../Helpers/constants';

// // Import icon libraries - you'll need to configure these
// // import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// interface WhatsAppChatInputProps {
//   onSendMessage: (message: string) => void;
//   onSendVoice: (audioUri: string) => void;
//   onOpenAttachments: () => void;
//   onOpenEmoji: () => void;
//   onOpenCamera: () => void;
//   placeholder?: string;
// }

// export const WhatsAppChatInput: React.FC<WhatsAppChatInputProps> = ({
//   onSendMessage,
//   onSendVoice,
//   onOpenAttachments,
//   onOpenEmoji,
//   onOpenCamera,
//   placeholder = 'Message',
// }) => {
//   const [message, setMessage] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const inputRef = useRef<TextInput>(null);

//   const handleSend = () => {
//     if (message.trim()) {
//       onSendMessage(message.trim());
//       setMessage('');
//       inputRef.current?.focus();
//     }
//   };

//   const handleStartRecording = () => {
//     setIsRecording(true);
//     Animated.timing(slideAnim, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleStopRecording = () => {
//     setIsRecording(false);
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => {
//       onSendVoice('audio-uri-placeholder');
//     });
//   };

//   const handleCancelRecording = () => {
//     setIsRecording(false);
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.inputContainer}>
//         {/* Emoji Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={onOpenEmoji}
//           activeOpacity={0.7}>
//           <View style={styles.icon}>
//             {/* Replace with Icon component: <Icon name="emoticon-happy-outline" size={24} color={Colors.textSecondary} /> */}
//             <View style={styles.placeholderIcon} />
//           </View>
//         </TouchableOpacity>

//         {/* Text Input */}
//         <View style={styles.inputWrapper}>
//           <TextInput
//             ref={inputRef}
//             style={styles.input}
//             value={message}
//             onChangeText={setMessage}
//             placeholder={placeholder}
//             placeholderTextColor={Colors.textTertiary}
//             multiline
//             maxLength={1000}
//             returnKeyType="default"
//             blurOnSubmit={false}
//           />
//         </View>

//         {/* Attachment Button */}
//         {!message && (
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={onOpenAttachments}
//             activeOpacity={0.7}>
//             <View style={styles.icon}>
//               {/* Replace with Icon component: <Icon name="paperclip" size={24} color={Colors.textSecondary} /> */}
//               <View style={styles.placeholderIcon} />
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* Camera Button */}
//         {!message && (
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={onOpenCamera}
//             activeOpacity={0.7}>
//             <View style={styles.icon}>
//               {/* Replace with Icon component: <Icon name="camera" size={22} color={Colors.textSecondary} /> */}
//               <View style={styles.placeholderIcon} />
//             </View>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Send/Voice Button */}
//       <TouchableOpacity
//         style={[
//           styles.sendButton,
//           message ? styles.sendButtonActive : styles.voiceButton,
//         ]}
//         onPress={message ? handleSend : undefined}
//         onPressIn={!message ? handleStartRecording : undefined}
//         onPressOut={!message ? handleStopRecording : undefined}
//         activeOpacity={0.8}>
//         <View style={styles.sendButtonInner}>
//           {/* Replace with Icon component */}
//           {/* {message ? (
//             <Icon name="send" size={20} color="#FFFFFF" />
//           ) : (
//             <Icon name="microphone" size={24} color="#FFFFFF" />
//           )} */}
//           <View style={styles.placeholderIcon} />
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: Spacing.sm,
//     backgroundColor: Colors.inputBackground,
//     borderTopWidth: 1,
//     borderTopColor: Colors.border,
//   },
//   inputContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     paddingHorizontal: Spacing.xs,
//     paddingVertical: Spacing.xs,
//     marginRight: Spacing.sm,
//     minHeight: 48,
//     maxHeight: 120,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   iconButton: {
//     width: 36,
//     height: 36,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: {
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   placeholderIcon: {
//     width: 20,
//     height: 20,
//     backgroundColor: Colors.textSecondary,
//     borderRadius: 10,
//   },
//   inputWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: Spacing.xs,
//   },
//   input: {
//     fontSize: FontSizes.md,
//     color: Colors.textPrimary,
//     paddingVertical: Spacing.sm,
//     paddingHorizontal: 0,
//     maxHeight: 100,
//     ...Platform.select({
//       ios: {
//         paddingTop: Spacing.sm,
//       },
//     }),
//   },
//   sendButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButtonActive: {
//     backgroundColor: Colors.primary,
//   },
//   voiceButton: {
//     backgroundColor: Colors.primary,
//   },
//   sendButtonInner: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Keyboard,
//   Platform,
//   KeyboardAvoidingView,
//   Animated,
//   BackHandler,
// } from 'react-native';
// import { InputMode } from '../types/inputTypes';
// import type { Sticker, Message } from '../types/inputTypes';
// import { UnifiedPanel } from './UnifiedPanel';
// import { VoiceRecorder } from './VoiceRecorder';

// interface ChatInputProps {
//   onSendMessage: (message: Message) => void;
// }

// export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
//   const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
//   const [text, setText] = useState('');
//   const [keyboardVisible, setKeyboardVisible] = useState(false);
//   const [voiceRecording, setVoiceRecording] = useState({
//     isRecording: false,
//     duration: 0,
//     amplitude: [] as number[],
//   });

//   const inputRef = useRef<TextInput>(null);
//   const panelHeightAnim = useRef(new Animated.Value(0)).current;
//   const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

//   // Define these callbacks BEFORE the useEffect hooks that use them
//   const showPanel = useCallback(() => {
//     Animated.spring(panelHeightAnim, {
//       toValue: 1,
//       useNativeDriver: false,
//       tension: 50,
//       friction: 8,
//     }).start();
//     setInputMode(InputMode.PANEL);
//   }, [panelHeightAnim]);

//   const hidePanel = useCallback(() => {
//     Animated.timing(panelHeightAnim, {
//       toValue: 0,
//       duration: 250,
//       useNativeDriver: false,
//     }).start(() => {
//       setInputMode(InputMode.TEXT);
//     });
//   }, [panelHeightAnim]);

//   // Keyboard listeners
//   useEffect(() => {
//     const keyboardWillShow = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       () => {
//         setKeyboardVisible(true);
//         // Hide panel when keyboard shows
//         if (inputMode === InputMode.PANEL) {
//           hidePanel();
//         }
//       }
//     );
//     const keyboardWillHide = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardVisible(false);
//         // Also hide panel when keyboard is dismissed (Android back button)
//         if (inputMode === InputMode.PANEL) {
//           hidePanel();
//         }
//       }
//     );

//     return () => {
//       keyboardWillShow.remove();
//       keyboardWillHide.remove();
//     };
//   }, [inputMode, hidePanel]);

//   // Handle Android back button
//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       () => {
//         if (inputMode === InputMode.PANEL) {
//           hidePanel();
//           return true; // Prevent default back behavior
//         }
//         return false; // Allow default back behavior
//       }
//     );

//     return () => backHandler.remove();
//   }, [inputMode, hidePanel]);

//   // Voice recording timer
//   useEffect(() => {
//     if (voiceRecording.isRecording) {
//       recordingTimerRef.current = setInterval(() => {
//         setVoiceRecording(prev => ({
//           ...prev,
//           duration: prev.duration + 1,
//           amplitude: [...prev.amplitude.slice(-20), Math.random() * 0.8 + 0.2],
//         }));
//       }, 1000);
//     } else {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//       }
//     }

//     return () => {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//       }
//     };
//   }, [voiceRecording.isRecording]);

//   const handlePanelToggle = useCallback(() => {
//     if (inputMode === InputMode.PANEL) {
//       // Close panel and focus input
//       hidePanel();
//       setTimeout(() => inputRef.current?.focus(), 100);
//     } else {
//       // Open panel
//       Keyboard.dismiss();
//       setTimeout(() => showPanel(), 100);
//     }
//   }, [inputMode, hidePanel, showPanel]);

//   const handleTextFocus = useCallback(() => {
//     if (inputMode === InputMode.PANEL) {
//       hidePanel();
//     }
//   }, [inputMode, hidePanel]);

//   const handleEmojiSelect = useCallback((emoji: string) => {
//     setText(prev => prev + emoji);
//     // Keep panel open after selecting emoji
//   }, []);

//   const handleBackspace = useCallback(() => {
//     setText(prev => {
//       if (!prev) return prev;

//       // Handle emoji and multi-byte characters properly
//       // Use Array.from to handle Unicode properly
//       const chars = Array.from(prev);
//       return chars.slice(0, -1).join('');
//     });
//   }, []);

//   const handleStickerSelect = useCallback(
//     (sticker: Sticker) => {
//       onSendMessage({
//         id: Date.now().toString(),
//         text: `[Sticker: ${sticker.id}]`,
//         timestamp: new Date(),
//         type: 'image',
//       });
//       hidePanel();
//     },
//     [onSendMessage, hidePanel]
//   );

//   const handleSendPress = useCallback(() => {
//     if (text.trim()) {
//       onSendMessage({
//         id: Date.now().toString(),
//         text: text.trim(),
//         timestamp: new Date(),
//         type: 'text',
//       });
//       setText('');
//     }
//   }, [text, onSendMessage]);

//   const handleVoiceLongPress = useCallback(() => {
//     setVoiceRecording({
//       isRecording: true,
//       duration: 0,
//       amplitude: [],
//     });
//   }, []);

//   const handleVoiceRelease = useCallback(() => {
//     if (voiceRecording.isRecording && voiceRecording.duration > 0) {
//       onSendMessage({
//         id: Date.now().toString(),
//         text: 'Voice message',
//         timestamp: new Date(),
//         type: 'voice',
//         duration: voiceRecording.duration,
//       });
//     }
//     setVoiceRecording({
//       isRecording: false,
//       duration: 0,
//       amplitude: [],
//     });
//   }, [voiceRecording, onSendMessage]);

//   const handleVoiceCancel = useCallback(() => {
//     setVoiceRecording({
//       isRecording: false,
//       duration: 0,
//       amplitude: [],
//     });
//   }, []);

//   const panelHeight = panelHeightAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 350],
//   });

//   return (
//     <View style={styles.container}>
//       {/* Voice Recording Overlay */}
//       {voiceRecording.isRecording && (
//         <VoiceRecorder
//           recording={voiceRecording}
//           onCancel={handleVoiceCancel}
//           onSend={handleVoiceRelease}
//         />
//       )}

//       {/* Input Bar */}
//       {!voiceRecording.isRecording && (
//         <View style={styles.inputBar}>
//           {/* Text Input Wrapper */}
//           <View style={styles.inputWrapper}>
//             {/* Emoji/Panel Toggle Button - Inside input on left */}
//             <TouchableOpacity
//               style={styles.emojiButton}
//               onPress={handlePanelToggle}
//               activeOpacity={0.6}>
//               <Text style={styles.emojiIcon}>
//                 {inputMode === InputMode.PANEL ? '⌨️' : '😊'}
//               </Text>
//             </TouchableOpacity>

//             {/* Text Input */}
//             <TextInput
//               ref={inputRef}
//               style={styles.textInput}
//               placeholder="Message"
//               placeholderTextColor="#999"
//               value={text}
//               onChangeText={setText}
//               onFocus={handleTextFocus}
//               multiline
//               maxLength={1000}
//               textAlignVertical="center"
//             />

//             {/* Attachment Buttons - only show when no text */}
//             {text.length === 0 && (
//               <View style={styles.attachmentButtons}>
//                 <TouchableOpacity
//                   style={styles.attachButton}
//                   activeOpacity={0.6}>
//                   <Text style={styles.attachIcon}>📎</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.attachButton}
//                   activeOpacity={0.6}>
//                   <Text style={styles.attachIcon}>📷</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Send or Voice Button - Outside input on right */}
//           {text.length > 0 ? (
//             <TouchableOpacity
//               style={[styles.actionButton, styles.sendButton]}
//               onPress={handleSendPress}
//               activeOpacity={0.6}>
//               <Text style={styles.sendIcon}>➤</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={styles.actionButton}
//               onLongPress={handleVoiceLongPress}
//               onPressOut={handleVoiceRelease}
//               activeOpacity={0.6}
//               delayLongPress={100}>
//               <Text style={styles.voiceIcon}>🎤</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       {/* Unified Panel (Emoji/GIF/Sticker) */}
//       {!keyboardVisible && (
//         <Animated.View style={[styles.panel, { height: panelHeight }]}>
//           {inputMode === InputMode.PANEL && (
//             <UnifiedPanel
//               onEmojiSelect={handleEmojiSelect}
//               onStickerSelect={handleStickerSelect}
//               onBackspace={handleBackspace}
//               hasText={text.length > 0}
//               onClose={hidePanel}
//             />
//           )}
//         </Animated.View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#F5F5F5',
//   },
//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//     gap: 8,
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//     borderRadius: 20,
//     paddingHorizontal: 8,
//     minHeight: 40,
//     maxHeight: 100,
//   },
//   emojiButton: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emojiIcon: {
//     fontSize: 22,
//   },
//   textInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     color: '#000',
//     minHeight: 32,
//   },
//   attachmentButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   attachButton: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   attachIcon: {
//     fontSize: 20,
//   },
//   actionButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendButton: {
//     backgroundColor: '#25D366',
//     borderRadius: 22,
//   },
//   sendIcon: {
//     fontSize: 20,
//     color: '#FFFFFF',
//   },
//   voiceIcon: {
//     fontSize: 24,
//   },
//   panel: {
//     overflow: 'hidden',
//     backgroundColor: '#FFFFFF',
//   },
// });
