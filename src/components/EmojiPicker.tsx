import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { EMOJI_CATEGORIES, addRecentEmoji, loadRecentEmojis, getCategoryWithRecents } from '../data/emojiData';

const { width } = Dimensions.get('window');
const EMOJI_SIZE = Math.floor(width / 8);

interface Props { onEmojiSelect: (emoji: string) => void; }

export const EmojiPicker: React.FC<Props> = ({ onEmojiSelect }) => {
  const [selectedCat, setSelectedCat] = useState(EMOJI_CATEGORIES[0].id);
  const [recents, setRecents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentEmojis().then(r => { setRecents(r); setLoading(false); });
  }, []);

  const handleEmojiPress = useCallback(async (emoji: string) => {
    const updated = await addRecentEmoji(emoji);
    if (updated.length) setRecents(updated);
    onEmojiSelect(emoji);
  }, [onEmojiSelect]);

  const currentCat = getCategoryWithRecents(selectedCat, recents);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currentCat?.emojis || []}
        keyExtractor={(item, i) => `${selectedCat}-${i}`}
        numColumns={8}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={40}
        windowSize={8}
        initialNumToRender={40}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emojiBtn}
            onPress={() => handleEmojiPress(item)}
            activeOpacity={0.6}
          >
            <Text style={styles.emoji}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Category tabs */}
      <View style={styles.bottomBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {EMOJI_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catTab, selectedCat === cat.id && styles.catTabActive]}
              onPress={() => setSelectedCat(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B141A' },
  grid: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 8 },
  emojiBtn: { width: EMOJI_SIZE, height: EMOJI_SIZE, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 26 },
  bottomBar: { borderTopWidth: 1, borderTopColor: '#2A3942', backgroundColor: '#1F2C34' },
  catScroll: { paddingVertical: 6, paddingHorizontal: 4, gap: 4 },
  catTab: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  catTabActive: { backgroundColor: '#2A3942' },
  catIcon: { fontSize: 22 },
});
