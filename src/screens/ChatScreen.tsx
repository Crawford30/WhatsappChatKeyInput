import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ChatInput } from '../components/ChatInput';
import type { Message } from '../types/inputTypes';

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
    },
    {
      id: '2',
      text: 'Great! Thanks for asking 😊',
      timestamp: new Date(Date.now() - 3500000),
      type: 'text',
    },
  ]);

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleSendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isVoice = item.type === 'voice';
    const isSticker = item.type === 'image';

    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageBubble}>
          {isVoice ? (
            <View style={styles.voiceMessage}>
              <Text style={styles.voiceIcon}>🎤</Text>
              <Text style={styles.messageText}>
                Voice message ({item.duration}s)
              </Text>
            </View>
          ) : isSticker ? (
            <View style={styles.stickerMessage}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>WhatsApp Voice Demo</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Background */}
        <View style={styles.chatBackground}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={[
              styles.messageList,
              { paddingBottom: insets.bottom },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1F2C34',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#E9EDEF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E9EDEF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8696A0',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerIcon: {
    fontSize: 20,
    color: '#E9EDEF',
  },
  chatBackground: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  messageContainer: {
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#005C4B',
    borderRadius: 8,
    padding: 8,
    maxWidth: '80%',
    minWidth: 100,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  stickerMessage: {
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: 15,
    color: '#E9EDEF',
  },
  timestamp: {
    fontSize: 11,
    color: '#8696A0',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
