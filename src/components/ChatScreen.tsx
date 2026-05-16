import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ChatInput } from './ChatInput';
import { VoiceRecorderProvider } from '../common/VoiceRecorderContext';
import { Message, AudioData } from '../types/inputTypes';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_BUBBLE_W = SCREEN_W * 0.72;

// ─── Initial messages ─────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
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
];

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fmtDur = (s?: number) => {
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// ─── StickerBubble — image with loading indicator ─────────────────────────────

const StickerBubble: React.FC<{ item: Message }> = ({ item }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isGif = item.type === 'gif';
  const uri = item.stickerUri;

  if (!uri) return null;

  return (
    <View style={bub.rowSelf}>
      <View
        style={
          isGif ? [bub.gifWrap, { width: MAX_BUBBLE_W }] : bub.stickerWrap
        }>
        {/* Loading spinner */}
        {loading && !error && (
          <View
            style={[
              bub.loadingOverlay,
              isGif ? { height: 180 } : { width: 160, height: 160 },
            ]}>
            <ActivityIndicator color="#00A884" />
          </View>
        )}

        {/* Error fallback */}
        {error ? (
          <View
            style={[
              bub.errorBox,
              isGif
                ? { width: MAX_BUBBLE_W, height: 180 }
                : { width: 160, height: 160 },
            ]}>
            <Text style={bub.errorIcon}>{isGif ? '🎞️' : '🖼️'}</Text>
            <Text style={bub.errorText}>{isGif ? 'GIF' : 'Sticker'}</Text>
          </View>
        ) : (
          <Image
            source={{ uri }}
            style={
              isGif
                ? { width: MAX_BUBBLE_W, height: 180 }
                : { width: 160, height: 160 }
            }
            resizeMode={isGif ? 'cover' : 'contain'}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}

        {/* GIF badge */}
        {isGif && !error && (
          <View style={bub.gifBadge}>
            <Text style={bub.gifBadgeText}>GIF</Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={[bub.time, isGif && bub.timeOverlay]}>
          {fmtTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );
};

// ─── MessageBubble ────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ item: Message }> = ({ item }) => {
  if (item.type === 'sticker' || item.type === 'gif') {
    return <StickerBubble item={item} />;
  }

  if (item.type === 'voice') {
    return (
      <View style={bub.rowSelf}>
        <View style={[bub.bubble, bub.voiceBubble]}>
          <View style={bub.playBtn}>
            <Text style={bub.playIcon}>▶</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={bub.waveform}>
              {Array.from({ length: 22 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    bub.wBar,
                    { height: 4 + Math.abs(Math.sin(i * 0.9)) * 14 },
                  ]}
                />
              ))}
            </View>
            <Text style={bub.duration}>{fmtDur(item.duration)}</Text>
          </View>
          <Text style={bub.time}>{fmtTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  }

  // text / image
  return (
    <View style={bub.rowSelf}>
      <View style={bub.bubble}>
        <Text style={bub.msgText}>{item.text}</Text>
        <Text style={bub.time}>{fmtTime(item.timestamp)}</Text>
      </View>
    </View>
  );
};

// ─── Styles for bubbles ───────────────────────────────────────────────────────

const bub = StyleSheet.create({
  rowSelf: { alignItems: 'flex-end', paddingHorizontal: 12, marginBottom: 4 },

  bubble: {
    backgroundColor: '#005C4B',
    borderRadius: 8,
    borderBottomRightRadius: 2,
    padding: 8,
    maxWidth: MAX_BUBBLE_W,
    minWidth: 80,
  },
  msgText: { fontSize: 15, color: '#E9EDEF', lineHeight: 20 },
  time: { fontSize: 11, color: '#8696A0', marginTop: 2, alignSelf: 'flex-end' },

  // sticker
  stickerWrap: { alignItems: 'flex-end' },

  // gif
  gifWrap: {
    backgroundColor: '#005C4B',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gifBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  gifBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 0,
  },

  // loading / error
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    zIndex: 1,
  },
  errorBox: {
    backgroundColor: '#1F2C34',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  errorIcon: { fontSize: 32 },
  errorText: { fontSize: 12, color: '#8696A0' },

  // voice
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    minWidth: 200,
    maxWidth: MAX_BUBBLE_W,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 2,
    marginBottom: 2,
  },
  wBar: { width: 2.5, backgroundColor: '#8696A0', borderRadius: 1.5 },
  duration: { fontSize: 11, color: '#8696A0' },
});

// ─── ChatScreen ───────────────────────────────────────────────────────────────

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
    console.log('[ChatScreen] audio:', audioData.uri);
  }, []);

  return (
    <VoiceRecorderProvider
      onSendAudio={handleSendAudio}
      maxRecordingDuration={300}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn}>
              <Text style={s.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={s.headerTitle}>WhatsApp Voice Demo</Text>
              <Text style={s.headerSub}>Online</Text>
            </View>
            <TouchableOpacity style={s.headerBtn}>
              <Text style={s.headerBtnIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn}>
              <Text style={s.headerBtnIcon}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <View style={s.chatBg}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => <MessageBubble item={item} />}
              keyExtractor={item => item.id}
              contentContainerStyle={[
                s.msgList,
                { paddingBottom: insets.bottom + 8 },
              ]}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <ChatInput onSendMessage={handleSendMessage} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </VoiceRecorderProvider>
  );
};

const s = StyleSheet.create({
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
  msgList: { paddingTop: 12 },
});

// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   Image,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { ChatInput } from './ChatInput';
// import { VoiceRecorderProvider } from '../common/VoiceRecorderContext';
// import { Message, AudioData } from '../types/inputTypes';

// const { width: SCREEN_W } = Dimensions.get('window');
// const MAX_BUBBLE_W = SCREEN_W * 0.72;

// // ─── Initial messages ─────────────────────────────────────────────────────────

// const INITIAL_MESSAGES: Message[] = [
//   {
//     id: '1',
//     text: 'Hey! How are you?',
//     timestamp: new Date(Date.now() - 3600000),
//     type: 'text',
//   },
//   {
//     id: '2',
//     text: 'Great! Thanks for asking 😊',
//     timestamp: new Date(Date.now() - 3500000),
//     type: 'text',
//   },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatTime = (d: Date) =>
//   d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// const formatDuration = (secs?: number) => {
//   if (!secs) return '0:00';
//   const m = Math.floor(secs / 60);
//   const s = Math.floor(secs % 60);
//   return `${m}:${s.toString().padStart(2, '0')}`;
// };

// // ─── MessageBubble ────────────────────────────────────────────────────────────
// // Handles all message types: text, sticker, gif, voice, image.

// const MessageBubble: React.FC<{ item: Message }> = ({ item }) => {
//   switch (item.type) {
//     // ── Sticker: no bubble, just the image ────────────────────────────────────
//     case 'sticker':
//       return (
//         <View style={b.rowSelf}>
//           <View>
//             <Image
//               source={{ uri: item.stickerUri }}
//               style={b.stickerImage}
//               resizeMode="contain"
//             />
//             <Text style={b.stickerTime}>{formatTime(item.timestamp)}</Text>
//           </View>
//         </View>
//       );

//     // ── GIF: image with badge ─────────────────────────────────────────────────
//     case 'gif':
//       return (
//         <View style={b.rowSelf}>
//           <View
//             style={[
//               b.bubble,
//               { padding: 0, overflow: 'hidden', width: MAX_BUBBLE_W },
//             ]}>
//             <Image
//               source={{ uri: item.stickerUri }}
//               style={{ width: MAX_BUBBLE_W, height: 180 }}
//               resizeMode="cover"
//             />
//             <View style={b.gifBadge}>
//               <Text style={b.gifBadgeText}>GIF</Text>
//             </View>
//             <View style={b.gifTime}>
//               <Text style={[b.time, { color: 'rgba(255,255,255,0.8)' }]}>
//                 {formatTime(item.timestamp)}
//               </Text>
//             </View>
//           </View>
//         </View>
//       );

//     // ── Voice ─────────────────────────────────────────────────────────────────
//     case 'voice':
//       return (
//         <View style={b.rowSelf}>
//           <View style={[b.bubble, b.voiceBubble]}>
//             <View style={b.playBtn}>
//               <Text style={b.playIcon}>▶</Text>
//             </View>
//             <View style={{ flex: 1 }}>
//               <View style={b.waveform}>
//                 {Array.from({ length: 22 }, (_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       b.wBar,
//                       { height: 4 + Math.abs(Math.sin(i * 0.9)) * 14 },
//                     ]}
//                   />
//                 ))}
//               </View>
//               <Text style={b.duration}>{formatDuration(item.duration)}</Text>
//             </View>
//             <Text style={b.time}>{formatTime(item.timestamp)}</Text>
//           </View>
//         </View>
//       );

//     // ── Text (default) ────────────────────────────────────────────────────────
//     default:
//       return (
//         <View style={b.rowSelf}>
//           <View style={b.bubble}>
//             <Text style={b.msgText}>{item.text}</Text>
//             <Text style={b.time}>{formatTime(item.timestamp)}</Text>
//           </View>
//         </View>
//       );
//   }
// };

// const b = StyleSheet.create({
//   rowSelf: {
//     alignItems: 'flex-end',
//     paddingHorizontal: 12,
//     marginBottom: 4,
//   },
//   bubble: {
//     backgroundColor: '#005C4B',
//     borderRadius: 8,
//     borderBottomRightRadius: 2,
//     padding: 8,
//     maxWidth: MAX_BUBBLE_W,
//     minWidth: 80,
//   },
//   msgText: { fontSize: 15, color: '#E9EDEF', lineHeight: 20 },
//   time: { fontSize: 11, color: '#8696A0', marginTop: 2, alignSelf: 'flex-end' },

//   // sticker
//   stickerImage: { width: 160, height: 160 },
//   stickerTime: {
//     fontSize: 11,
//     color: '#8696A0',
//     marginTop: 2,
//     textAlign: 'right',
//   },

//   // gif
//   gifBadge: {
//     position: 'absolute',
//     top: 6,
//     left: 8,
//     backgroundColor: 'rgba(0,0,0,0.55)',
//     borderRadius: 4,
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//   },
//   gifBadgeText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   gifTime: { position: 'absolute', bottom: 6, right: 8 },

//   // voice
//   voiceBubble: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     paddingVertical: 10,
//     minWidth: 200,
//   },
//   playBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#00A884',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
//   waveform: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 24,
//     gap: 2,
//     marginBottom: 2,
//   },
//   wBar: { width: 2.5, backgroundColor: '#8696A0', borderRadius: 1.5 },
//   duration: { fontSize: 11, color: '#8696A0' },
// });

// // ─── ChatScreen ───────────────────────────────────────────────────────────────

// export const ChatScreen: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
//   const flatListRef = useRef<FlatList>(null);
//   const insets = useSafeAreaInsets();

//   const scrollToEnd = useCallback(() => {
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) scrollToEnd();
//   }, [messages.length]);

//   const handleSendMessage = useCallback((message: Message) => {
//     setMessages(prev => [...prev, message]);
//   }, []);

//   const handleSendAudio = useCallback(async (audioData: AudioData) => {
//     console.log('[ChatScreen] Sending audio:', audioData.uri);
//   }, []);

//   return (
//     <VoiceRecorderProvider
//       onSendAudio={handleSendAudio}
//       maxRecordingDuration={300}>
//       <SafeAreaView style={s.safe} edges={['top']}>
//         <KeyboardAvoidingView
//           style={s.flex}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//           {/* Header */}
//           <View style={s.header}>
//             <TouchableOpacity style={s.backBtn}>
//               <Text style={s.backIcon}>←</Text>
//             </TouchableOpacity>
//             <View style={s.headerInfo}>
//               <Text style={s.headerTitle}>WhatsApp Voice Demo</Text>
//               <Text style={s.headerSub}>Online</Text>
//             </View>
//             <TouchableOpacity style={s.headerBtn}>
//               <Text style={s.headerBtnIcon}>📞</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={s.headerBtn}>
//               <Text style={s.headerBtnIcon}>⋮</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Messages */}
//           <View style={s.chatBg}>
//             <FlatList
//               ref={flatListRef}
//               data={messages}
//               renderItem={({ item }) => <MessageBubble item={item} />}
//               keyExtractor={item => item.id}
//               contentContainerStyle={[
//                 s.msgList,
//                 { paddingBottom: insets.bottom + 8 },
//               ]}
//               showsVerticalScrollIndicator={false}
//             />
//           </View>

//           {/* Input */}
//           <ChatInput onSendMessage={handleSendMessage} />
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </VoiceRecorderProvider>
//   );
// };

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#0B141A' },
//   flex: { flex: 1 },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#1F2C34',
//     borderBottomWidth: 1,
//     borderBottomColor: '#2A3942',
//   },
//   backBtn: { padding: 8 },
//   backIcon: { fontSize: 22, color: '#E9EDEF' },
//   headerInfo: { flex: 1, marginLeft: 8 },
//   headerTitle: { fontSize: 16, fontWeight: '600', color: '#E9EDEF' },
//   headerSub: { fontSize: 12, color: '#8696A0' },
//   headerBtn: { padding: 8, marginLeft: 4 },
//   headerBtnIcon: { fontSize: 20, color: '#E9EDEF' },
//   chatBg: { flex: 1, backgroundColor: '#0B141A' },
//   msgList: { paddingTop: 12 },
// });

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
// import { ChatInput } from './ChatInput';
// import { VoiceRecorderProvider } from '../common/VoiceRecorderContext';
// import { Message, AudioData } from '../types/inputTypes';

// const INITIAL_MESSAGES: Message[] = [
//   {
//     id: '1',
//     text: 'Hey! How are you?',
//     timestamp: new Date(Date.now() - 3600000),
//     type: 'text',
//   },
//   {
//     id: '2',
//     text: 'Great! Thanks for asking 😊',
//     timestamp: new Date(Date.now() - 3500000),
//     type: 'text',
//   },
//   {
//     id: '3',
//     text: 'What are you up to today?',
//     timestamp: new Date(Date.now() - 3000000),
//     type: 'text',
//   },
// ];

// const formatTime = (d: Date) =>
//   d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// const MessageBubble: React.FC<{ item: Message }> = ({ item }) => {
//   const isVoice = item.type === 'voice';
//   const isSticker = item.type === 'image';

//   return (
//     <View style={bubbleStyles.container}>
//       <View style={bubbleStyles.bubble}>
//         {isVoice ? (
//           <View style={bubbleStyles.voiceRow}>
//             <View style={bubbleStyles.playBtn}>
//               <Text style={bubbleStyles.playIcon}>▶</Text>
//             </View>
//             <View style={bubbleStyles.voiceInfo}>
//               <View style={bubbleStyles.waveform}>
//                 {Array.from({ length: 20 }, (_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       bubbleStyles.wBar,
//                       { height: 2 + Math.sin(i * 0.8) * 8 + 6 },
//                     ]}
//                   />
//                 ))}
//               </View>
//               <Text style={bubbleStyles.duration}>{item.duration ?? 0}s</Text>
//             </View>
//           </View>
//         ) : isSticker ? (
//           <Text style={bubbleStyles.msgText}>{item.text}</Text>
//         ) : (
//           <Text style={bubbleStyles.msgText}>{item.text}</Text>
//         )}
//         <Text style={bubbleStyles.time}>{formatTime(item.timestamp)}</Text>
//       </View>
//     </View>
//   );
// };

// const bubbleStyles = StyleSheet.create({
//   container: { marginBottom: 4, alignItems: 'flex-end', paddingHorizontal: 12 },
//   bubble: {
//     backgroundColor: '#005C4B',
//     borderRadius: 8,
//     borderBottomRightRadius: 2,
//     padding: 8,
//     maxWidth: '82%',
//     minWidth: 80,
//   },
//   msgText: { fontSize: 15, color: '#E9EDEF', lineHeight: 20 },
//   time: { fontSize: 11, color: '#8696A0', marginTop: 4, alignSelf: 'flex-end' },
//   voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   playBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#00A884',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   playIcon: { color: '#fff', fontSize: 12, marginLeft: 2 },
//   voiceInfo: { flex: 1 },
//   waveform: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 24,
//     gap: 2,
//     marginBottom: 2,
//   },
//   wBar: { width: 2.5, backgroundColor: '#8696A0', borderRadius: 1.5 },
//   duration: { fontSize: 11, color: '#8696A0' },
// });

// export const ChatScreen: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
//   const flatListRef = useRef<FlatList>(null);
//   const insets = useSafeAreaInsets();

//   const scrollToEnd = useCallback(() => {
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0) scrollToEnd();
//   }, [messages.length]);

//   const handleSendMessage = useCallback((message: Message) => {
//     setMessages(prev => [...prev, message]);
//   }, []);

//   const handleSendAudio = useCallback(async (audioData: AudioData) => {
//     // Upload / process audioData.uri here
//     console.log('[ChatScreen] Sending audio:', audioData.uri);
//   }, []);

//   return (
//     <VoiceRecorderProvider
//       onSendAudio={handleSendAudio}
//       maxRecordingDuration={300}>
//       <SafeAreaView style={styles.safe} edges={['top']}>
//         <KeyboardAvoidingView
//           style={styles.flex}
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity style={styles.backBtn}>
//               <Text style={styles.backIcon}>←</Text>
//             </TouchableOpacity>
//             <View style={styles.headerInfo}>
//               <Text style={styles.headerTitle}>WhatsApp Chat Input</Text>
//               <Text style={styles.headerSub}>Online</Text>
//             </View>
//             <TouchableOpacity style={styles.headerBtn}>
//               <Text style={styles.headerBtnIcon}>📞</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.headerBtn}>
//               <Text style={styles.headerBtnIcon}>⋮</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Messages */}
//           <View style={styles.chatBg}>
//             <FlatList
//               ref={flatListRef}
//               data={messages}
//               renderItem={({ item }) => <MessageBubble item={item} />}
//               keyExtractor={item => item.id}
//               contentContainerStyle={[
//                 styles.msgList,
//                 { paddingBottom: insets.bottom + 8 },
//               ]}
//               showsVerticalScrollIndicator={false}
//             />
//           </View>

//           {/* Chat Input */}
//           <ChatInput onSendMessage={handleSendMessage} />
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </VoiceRecorderProvider>
//   );
// };

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#0B141A' },
//   flex: { flex: 1 },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#1F2C34',
//     borderBottomWidth: 1,
//     borderBottomColor: '#2A3942',
//   },
//   backBtn: { padding: 8 },
//   backIcon: { fontSize: 22, color: '#E9EDEF' },
//   headerInfo: { flex: 1, marginLeft: 8 },
//   headerTitle: { fontSize: 16, fontWeight: '600', color: '#E9EDEF' },
//   headerSub: { fontSize: 12, color: '#8696A0' },
//   headerBtn: { padding: 8, marginLeft: 4 },
//   headerBtnIcon: { fontSize: 20, color: '#E9EDEF' },
//   chatBg: { flex: 1, backgroundColor: '#0B141A' },
//   msgList: { paddingHorizontal: 0, paddingTop: 12 },
// });
