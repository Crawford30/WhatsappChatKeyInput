/**
 * MessageBubble.tsx
 *
 * Renders a single chat message correctly for every type:
 *   text   → green bubble with text
 *   sticker → transparent background, image only (160×160)
 *   gif    → image in a rounded container with "GIF" badge
 *   voice  → bubble with waveform placeholder + duration
 *   image  → image in a bubble (for photo attachments)
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Message } from '../types/inputTypes';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_BUBBLE_W = SCREEN_W * 0.72;
const STICKER_SIZE = 160;
const GIF_MAX_W = MAX_BUBBLE_W;
const GIF_HEIGHT = 180;

interface Props {
  message: Message;
  /** true = sent by local user (right-aligned green); false = received (left grey) */
  isSelf?: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

const TimeStamp: React.FC<{ date: Date; light?: boolean }> = ({
  date,
  light,
}) => (
  <Text style={[styles.time, light && styles.timeLight]}>
    {formatTime(date)}
  </Text>
);

// Sticker: no bubble, just the image
const StickerBubble: React.FC<{ message: Message; isSelf: boolean }> = ({
  message,
  isSelf,
}) => (
  <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}>
    <View style={styles.stickerWrap}>
      <Image
        source={{ uri: message.stickerUri }}
        style={styles.stickerImage}
        resizeMode="contain"
      />
      <Text style={styles.stickerTime}>{formatTime(message.timestamp)}</Text>
    </View>
  </View>
);

// GIF: image with a GIF badge
const GifBubble: React.FC<{ message: Message; isSelf: boolean }> = ({
  message,
  isSelf,
}) => (
  <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}>
    <View
      style={[
        styles.gifContainer,
        isSelf ? styles.bubbleSelf : styles.bubbleOther,
      ]}>
      <Image
        source={{ uri: message.stickerUri }}
        style={styles.gifImage}
        resizeMode="cover"
      />
      <View style={styles.gifBadge}>
        <Text style={styles.gifBadgeText}>GIF</Text>
      </View>
      <View style={styles.gifFooter}>
        <TimeStamp date={message.timestamp} light />
      </View>
    </View>
  </View>
);

// Voice message bubble
const VoiceBubble: React.FC<{ message: Message; isSelf: boolean }> = ({
  message,
  isSelf,
}) => (
  <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}>
    <View
      style={[
        styles.bubble,
        isSelf ? styles.bubbleSelf : styles.bubbleOther,
        styles.voiceBubble,
      ]}>
      {/* Mic icon */}
      <View style={styles.micCircle}>
        <Text style={styles.micIcon}>🎙️</Text>
      </View>

      {/* Waveform placeholder */}
      <View style={styles.waveRow}>
        {Array.from({ length: 20 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              { height: 4 + Math.sin(i * 0.7) * 8 + Math.random() * 4 },
            ]}
          />
        ))}
      </View>

      {/* Duration + time */}
      <View style={styles.voiceMeta}>
        <Text style={styles.voiceDuration}>
          {formatDuration(message.duration)}
        </Text>
        <TimeStamp date={message.timestamp} />
      </View>
    </View>
  </View>
);

// Plain text / image bubble
const TextBubble: React.FC<{ message: Message; isSelf: boolean }> = ({
  message,
  isSelf,
}) => (
  <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowOther]}>
    <View
      style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
      {message.type === 'image' && message.uri ? (
        <Image
          source={{ uri: message.uri }}
          style={styles.inlineImage}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.messageText, !isSelf && styles.messageTextOther]}>
          {message.text}
        </Text>
      )}
      <View style={styles.metaRow}>
        <TimeStamp date={message.timestamp} />
      </View>
    </View>
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const MessageBubble: React.FC<Props> = ({ message, isSelf = true }) => {
  switch (message.type) {
    case 'sticker':
      return <StickerBubble message={message} isSelf={isSelf} />;
    case 'gif':
      return <GifBubble message={message} isSelf={isSelf} />;
    case 'voice':
      return <VoiceBubble message={message} isSelf={isSelf} />;
    default:
      return <TextBubble message={message} isSelf={isSelf} />;
  }
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  rowSelf: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  // ── Text bubble ────────────────────────────────────────────────────────────
  bubble: {
    maxWidth: MAX_BUBBLE_W,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  bubbleSelf: { backgroundColor: '#005C4B' },
  bubbleOther: { backgroundColor: '#1F2C34' },

  messageText: {
    fontSize: 15,
    color: '#E9EDEF',
    lineHeight: 20,
  },
  messageTextOther: { color: '#E9EDEF' },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: '#8696A0',
  },
  timeLight: { color: 'rgba(255,255,255,0.7)' },

  inlineImage: {
    width: MAX_BUBBLE_W - 20,
    height: 200,
    borderRadius: 6,
    marginBottom: 4,
  },

  // ── Sticker ────────────────────────────────────────────────────────────────
  stickerWrap: {
    width: STICKER_SIZE,
    alignItems: 'flex-end',
  },
  stickerImage: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
  },
  stickerTime: {
    fontSize: 11,
    color: '#8696A0',
    marginTop: 2,
    marginRight: 2,
  },

  // ── GIF ────────────────────────────────────────────────────────────────────
  gifContainer: {
    width: GIF_MAX_W,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 0,
  },
  gifImage: {
    width: GIF_MAX_W,
    height: GIF_HEIGHT,
  },
  gifBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
  gifFooter: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },

  // ── Voice ──────────────────────────────────────────────────────────────────
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
    minWidth: 200,
  },
  micCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: { fontSize: 16 },
  waveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#8696A0',
    borderRadius: 1.5,
  },
  voiceMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#8696A0',
  },
});
