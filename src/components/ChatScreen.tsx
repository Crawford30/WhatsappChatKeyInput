import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, KeyboardAvoidingView,
  Platform, Text, TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatInput } from './ChatInput';
import { VoiceRecorderProvider } from '../context/VoiceRecorderContext';
import { Message, AudioData } from '../types';

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hey! How are you?', timestamp: new Date(Date.now() - 3600000), type: 'text' },
  { id: '2', text: 'Great! Thanks for asking 😊', timestamp: new Date(Date.now() - 3500000), type: 'text' },
  { id: '3', text: 'What are you up to today?', timestamp: new Date(Date.now() - 3000000), type: 'text' },
];

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const MessageBubble: React.FC<{ item: Message }> = ({ item }) => {
  const isVoice = item.type === 'voice';
  const isSticker = item.type === 'image';

  return (
    <View style={bubbleStyles.container}>
      <View style={bubbleStyles.bubble}>
        {isVoice ? (
          <View style={bubbleStyles.voiceRow}>
            <View style={bubbleStyles.playBtn}>
              <Text style={bubbleStyles.playIcon}>▶</Text>
            </View>
            <View style={bubbleStyles.voiceInfo}>
              <View style={bubbleStyles.waveform}>
                {Array.from({ length: 20 }, (_, i) => (
                  <View key={i} style={[bubbleStyles.wBar, { height: 2 + Math.sin(i * 0.8) * 8 + 6 }]} />
                ))}
              </View>
              <Text style={bubbleStyles.duration}>{item.duration ?? 0}s</Text>
            </View>
          </View>
        ) : isSticker ? (
          <Text style={bubbleStyles.msgText}>{item.text}</Text>
        ) : (
          <Text style={bubbleStyles.msgText}>{item.text}</Text>
        )}
        <Text style={bubbleStyles.time}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );
};

const bubbleStyles = StyleSheet.create({
  container: { marginBottom: 4, alignItems: 'flex-end', paddingHorizontal: 12 },
  bubble: {
    backgroundColor: '#005C4B',
    borderRadius: 8,
    borderBottomRightRadius: 2,
    padding: 8,
    maxWidth: '82%',
    minWidth: 80,
  },
  msgText: { fontSize: 15, color: '#E9EDEF', lineHeight: 20 },
  time: { fontSize: 11, color: '#8696A0', marginTop: 4, alignSelf: 'flex-end' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#00A884', justifyContent: 'center', alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
  voiceInfo: { flex: 1 },
  waveform: { flexDirection: 'row', alignItems: 'center', height: 24, gap: 2, marginBottom: 2 },
  wBar: { width: 2.5, backgroundColor: '#8696A0', borderRadius: 1.5 },
  duration: { fontSize: 11, color: '#8696A0' },
});

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length]);

  const handleSendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleSendAudio = useCallback(async (audioData: AudioData) => {
    // Upload / process audioData.uri here
    console.log('[ChatScreen] Sending audio:', audioData.uri);
  }, []);

  return (
    <VoiceRecorderProvider onSendAudio={handleSendAudio} maxRecordingDuration={300}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>WhatsApp Chat Input</Text>
              <Text style={styles.headerSub}>Online</Text>
            </View>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnIcon}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <View style={styles.chatBg}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => <MessageBubble item={item} />}
              keyExtractor={item => item.id}
              contentContainerStyle={[styles.msgList, { paddingBottom: insets.bottom + 8 }]}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </VoiceRecorderProvider>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B141A' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1F2C34',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 22, color: '#E9EDEF' },
  headerInfo: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#E9EDEF' },
  headerSub: { fontSize: 12, color: '#8696A0' },
  headerBtn: { padding: 8, marginLeft: 4 },
  headerBtnIcon: { fontSize: 20, color: '#E9EDEF' },
  chatBg: { flex: 1, backgroundColor: '#0B141A' },
  msgList: { paddingHorizontal: 0, paddingTop: 12 },
});
