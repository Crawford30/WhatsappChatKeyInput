import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';

import { WhatsAppChatInput } from '../components/ChatInput';
import { AttachmentMenu } from '../components/AttachmentMenu';
import { EmojiPicker } from '../components/EmojiPicker';
import { StickerPicker } from '../components/StickerPicker';
import { CreateStickerModal } from '../components/CreateStickerModal';
import { Colors, Spacing, FontSizes, BorderRadius } from '../Helpers/constants';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOutgoing: boolean;
  type: 'text' | 'image' | 'voice' | 'sticker';
}

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you?',
      timestamp: new Date(),
      isOutgoing: false,
      type: 'text',
    },
    {
      id: '2',
      text: "I'm doing great! Thanks for asking 😊",
      timestamp: new Date(),
      isOutgoing: true,
      type: 'text',
    },
  ]);

  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showCreateSticker, setShowCreateSticker] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'emoji' | 'sticker'>(
    'text'
  );

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      isOutgoing: true,
      type: 'text',
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendVoice = (audioUri: string) => {
    console.log('Voice message:', audioUri);
    // Handle voice message
  };

  const handleEmojiSelect = (emoji: string) => {
    // This would typically insert emoji at cursor position in the input
    console.log('Emoji selected:', emoji);
  };

  const handleStickerSelect = (sticker: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: sticker,
      timestamp: new Date(),
      isOutgoing: true,
      type: 'sticker',
    };
    setMessages(prev => [...prev, newMessage]);
    setShowStickers(false);
    setInputMode('text');
  };

  const handleOpenEmoji = () => {
    if (inputMode === 'emoji') {
      setInputMode('text');
      setShowEmoji(false);
      setShowStickers(false);
    } else {
      setInputMode('emoji');
      setShowEmoji(true);
      setShowStickers(false);
    }
  };

  const handleOpenStickers = () => {
    if (inputMode === 'sticker') {
      setInputMode('text');
      setShowEmoji(false);
      setShowStickers(false);
    } else {
      setInputMode('sticker');
      setShowEmoji(false);
      setShowStickers(true);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
      ]}>
      <View
        style={[
          styles.messageBubble,
          item.isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
        ]}>
        {item.type === 'sticker' ? (
          <Text style={styles.stickerText}>{item.text}</Text>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Chat Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>John Doe</Text>
              <Text style={styles.headerStatus}>online</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />
        </View>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <WhatsAppChatInput
            onSendMessage={handleSendMessage}
            onSendVoice={handleSendVoice}
            onOpenAttachments={() => setShowAttachments(true)}
            onOpenEmoji={handleOpenEmoji}
            onOpenCamera={() => console.log('Open camera')}
          />
        </View>

        {/* Emoji/Sticker Panel */}
        {inputMode === 'emoji' && (
          <EmojiPicker visible={showEmoji} onEmojiSelect={handleEmojiSelect} />
        )}

        {inputMode === 'sticker' && (
          <StickerPicker
            visible={showStickers}
            onStickerSelect={handleStickerSelect}
            onCreateSticker={() => {
              setShowCreateSticker(true);
              setShowStickers(false);
            }}
          />
        )}

        {/* Attachment Menu */}
        <AttachmentMenu
          visible={showAttachments}
          onClose={() => setShowAttachments(false)}
          onDocumentPress={() => console.log('Document')}
          onCameraPress={() => console.log('Camera')}
          onGalleryPress={() => console.log('Gallery')}
          onAudioPress={() => console.log('Audio')}
          onLocationPress={() => console.log('Location')}
          onContactPress={() => console.log('Contact')}
          onPollPress={() => console.log('Poll')}
          onEventPress={() => console.log('Event')}
        />

        {/* Create Sticker Modal */}
        <CreateStickerModal
          visible={showCreateSticker}
          onClose={() => setShowCreateSticker(false)}
          onCamera={() => console.log('Camera for sticker')}
          onUseAI={() => console.log('Use AI')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.chatBackground,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerStatus: {
    fontSize: FontSizes.sm,
    color: '#E0F5E9',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  incomingContainer: {
    alignItems: 'flex-start',
  },
  outgoingContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  incomingBubble: {
    backgroundColor: Colors.incomingBubble,
    borderTopLeftRadius: 4,
  },
  outgoingBubble: {
    backgroundColor: Colors.outgoingBubble,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  stickerText: {
    fontSize: 72,
  },
  timestamp: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  inputArea: {
    backgroundColor: Colors.inputBackground,
  },
});

// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   TouchableOpacity,
// } from 'react-native';
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { ChatInput } from '../components/ChatInput';
// import type { Message } from '../types/inputTypes';

// export const ChatScreen: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       text: 'Hey! How are you?',
//       timestamp: new Date(Date.now() - 3600000),
//       type: 'text',
//     },
//     {
//       id: '2',
//       text: 'Great! Thanks for asking 😊',
//       timestamp: new Date(Date.now() - 3500000),
//       type: 'text',
//     },
//   ]);

//   const flatListRef = useRef<FlatList>(null);
//   const insets = useSafeAreaInsets();

//   const handleSendMessage = useCallback((message: Message) => {
//     setMessages(prev => [...prev, message]);
//   }, []);

//   useEffect(() => {
//     // Auto-scroll to bottom when new message is added
//     if (messages.length > 0) {
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       }, 100);
//     }
//   }, [messages.length]);

//   const renderMessage = useCallback(({ item }: { item: Message }) => {
//     const isVoice = item.type === 'voice';
//     const isSticker = item.type === 'image';

//     return (
//       <View style={styles.messageContainer}>
//         <View style={styles.messageBubble}>
//           {isVoice ? (
//             <View style={styles.voiceMessage}>
//               <Text style={styles.voiceIcon}>🎤</Text>
//               <Text style={styles.messageText}>
//                 Voice message ({item.duration}s)
//               </Text>
//             </View>
//           ) : isSticker ? (
//             <View style={styles.stickerMessage}>
//               <Text style={styles.messageText}>{item.text}</Text>
//             </View>
//           ) : (
//             <Text style={styles.messageText}>{item.text}</Text>
//           )}
//           <Text style={styles.timestamp}>
//             {item.timestamp.toLocaleTimeString([], {
//               hour: '2-digit',
//               minute: '2-digit',
//             })}
//           </Text>
//         </View>
//       </View>
//     );
//   }, []);

//   const renderHeader = useCallback(
//     () => (
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <View style={styles.headerInfo}>
//           <Text style={styles.headerTitle}>WhatsApp Chat</Text>
//           <Text style={styles.headerSubtitle}>online</Text>
//         </View>
//         <TouchableOpacity style={styles.menuButton}>
//           <Text style={styles.menuIcon}>⋮</Text>
//         </TouchableOpacity>
//       </View>
//     ),
//     []
//   );

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { paddingTop: insets.top, paddingBottom: insets.bottom },
//       ]}>
//       {renderHeader()}
//       <KeyboardAvoidingView
//         style={styles.keyboardAvoid}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
//         <View style={styles.chatContainer}>
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             renderItem={renderMessage}
//             keyExtractor={item => item.id}
//             contentContainerStyle={styles.messageList}
//             showsVerticalScrollIndicator={false}
//           />
//           <ChatInput onSendMessage={handleSendMessage} />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 10,
//     backgroundColor: '#25D366',
//     borderBottomWidth: 1,
//     borderBottomColor: '#20BC5A',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backIcon: {
//     fontSize: 28,
//     color: '#FFFFFF',
//   },
//   headerInfo: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     color: '#E0F5E9',
//   },
//   menuButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   menuIcon: {
//     fontSize: 24,
//     color: '#FFFFFF',
//   },
//   keyboardAvoid: {
//     flex: 1,
//   },
//   chatContainer: {
//     flex: 1,
//     backgroundColor: '#E5DDD5',
//   },
//   messageList: {
//     paddingHorizontal: 12,
//     paddingTop: 12,
//     paddingBottom: 8,
//   },
//   messageContainer: {
//     marginBottom: 12,
//     alignItems: 'flex-end',
//   },
//   messageBubble: {
//     backgroundColor: '#DCF8C6',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     maxWidth: '80%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//     elevation: 1,
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#000',
//     marginBottom: 4,
//   },
//   timestamp: {
//     fontSize: 11,
//     color: '#667781',
//     alignSelf: 'flex-end',
//   },
//   voiceMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   voiceIcon: {
//     fontSize: 20,
//   },
//   stickerMessage: {
//     backgroundColor: 'transparent',
//   },
// });
