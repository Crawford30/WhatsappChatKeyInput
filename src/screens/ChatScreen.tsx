import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  configSecondary,
  dimWhite,
  primaryColor,
} from '../assets/style/Colors';
import { BackButtonSVG } from '../assets/svg/BackButtonSVG';
import { MoreSVG } from '../assets/svg/MoreSVG';
import { ChatInput } from '../components/ChatInput';
import { MessageBubble } from '../components/MessageBubble';
import { MediaViewer } from '../components/media/MediaViewer';
import { defaultPickers } from '../pickers';
import type { Message } from '../types/inputTypes';

const HOUR = 3600000;

const CHAT_TITLE = 'WhatsApp Chat';

const initials = (name: string) =>
  name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello',
      timestamp: new Date(Date.now() - 24 * HOUR),
      type: 'text',
      fromMe: false,
    },
    {
      id: '2',
      text: 'Hey! How are you?',
      timestamp: new Date(Date.now() - HOUR),
      type: 'text',
    },
    {
      id: '3',
      text: 'Great! Thanks for asking 😊',
      timestamp: new Date(Date.now() - 0.9 * HOUR),
      type: 'text',
    },
  ]);

  const [viewing, setViewing] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleSendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const scrollToBottom = useCallback((animated = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new message is added
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, scrollToBottom]);

  // View-once photos can be opened a single time
  const openMedia = useCallback((message: Message) => {
    if (message.attachment?.kind !== 'image') return;
    setViewing(message);
    if (message.viewOnce) {
      setMessages(prev =>
        prev.map(m =>
          m.id === message.id ? { ...m, viewOnceOpened: true } : m
        )
      );
    }
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageBubble
        message={item}
        prevMessage={messages[index - 1]}
        onOpenMedia={openMedia}
      />
    ),
    [messages, openMedia]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton}>
        <BackButtonSVG width={24} height={24} />
      </TouchableOpacity>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(CHAT_TITLE)}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {CHAT_TITLE}
        </Text>
        <Text style={styles.headerSubtitle}>online</Text>
      </View>
      <TouchableOpacity style={styles.headerButton}>
        <MoreSVG width={22} height={22} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    // ChatInput reserves the keyboard / emoji panel / bottom inset space itself
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderHeader()}
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Keep the latest message visible when the keyboard or panel opens
          onLayout={() => scrollToBottom(false)}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          recipientName={CHAT_TITLE}
          pickers={defaultPickers}
        />
      </View>
      <MediaViewer
        uri={viewing?.attachment?.uri ?? null}
        caption={viewing?.text}
        viewOnce={viewing?.viewOnce}
        onClose={() => setViewing(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 4,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: primaryColor,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
  },
  headerSubtitle: {
    fontSize: 12,
    color: configSecondary,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: dimWhite,
  },
  messageList: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});
