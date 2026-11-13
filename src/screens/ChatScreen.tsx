import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChatInput, type ChatInputHandle} from '../components/ChatInput';
import {formatDuration, formatTime} from '../Helpers/helper';
import type {Message} from '../types/inputTypes';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    fromMe: false,
    type: 'text',
    text: 'Hey! How are you?',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    fromMe: true,
    type: 'text',
    text: 'Great! Thanks for asking 😊',
    timestamp: new Date(Date.now() - 3500000),
  },
];

const MessageRow = React.memo(({item}: {item: Message}) => {
  const time = (
    <Text style={styles.time}>
      {formatTime(item.timestamp)}
      {item.fromMe ? '  ✓✓' : ''}
    </Text>
  );

  if (item.type === 'sticker') {
    return (
      <View style={[styles.row, item.fromMe ? styles.rowMine : styles.rowTheirs]}>
        <Text style={styles.sticker} accessibilityLabel={`Sticker ${item.sticker}`}>
          {item.sticker}
        </Text>
        <View style={styles.stickerTime}>{time}</View>
      </View>
    );
  }

  return (
    <View style={[styles.row, item.fromMe ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, item.fromMe ? styles.mine : styles.theirs]}>
        {item.type === 'voice' ? (
          <View
            style={styles.voice}
            accessibilityLabel={`Voice message, ${formatDuration(item.durationMs)}`}>
            <Text style={styles.play}>▶</Text>
            <View style={styles.voiceTrack} />
            <Text style={styles.voiceDuration}>
              {formatDuration(item.durationMs)}
            </Text>
          </View>
        ) : (
          <Text style={styles.text}>{item.text}</Text>
        )}
        {time}
      </View>
    </View>
  );
});

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const listRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<ChatInputHandle>(null);

  // inverted list: newest first, so the latest message sits at the bottom
  // and stays there as the keyboard or panel opens
  const data = useMemo(() => [...messages].reverse(), [messages]);

  const handleSendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>W</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>WhatsApp Chat</Text>
          <Text style={styles.headerSubtitle}>online</Text>
        </View>
      </View>
      <View style={styles.chat}>
        <FlatList
          ref={listRef}
          data={data}
          inverted
          renderItem={({item}) => <MessageRow item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => inputRef.current?.close()}
        />
        <ChatInput ref={inputRef} onSendMessage={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#008069',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#008069',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DFE5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#54656F',
    fontWeight: '600',
    fontSize: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D9FDD3',
  },
  chat: {
    flex: 1,
    backgroundColor: '#EFEAE2',
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  row: {
    marginVertical: 3,
  },
  rowMine: {
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  mine: {
    backgroundColor: '#D9FDD3',
  },
  theirs: {
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    color: '#111B21',
  },
  time: {
    alignSelf: 'flex-end',
    marginTop: 2,
    fontSize: 11,
    color: '#667781',
  },
  sticker: {
    fontSize: 96,
    lineHeight: 112,
  },
  stickerTime: {
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    paddingVertical: 4,
  },
  play: {
    fontSize: 18,
    color: '#54656F',
    marginRight: 8,
  },
  voiceTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#8696A0',
  },
  voiceDuration: {
    marginLeft: 8,
    fontSize: 12,
    color: '#667781',
  },
});
