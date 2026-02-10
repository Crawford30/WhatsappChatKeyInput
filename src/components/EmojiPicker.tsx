import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  EMOJI_CATEGORIES,
  addRecentEmoji,
  loadRecentEmojis,
  getCategoryWithRecents,
} from '../data/emojiData';

const { width } = Dimensions.get('window');
const EMOJI_SIZE = width / 8;
const NUM_COLUMNS = 8;

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(
    EMOJI_CATEGORIES[0].id
  );
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent emojis on mount
  useEffect(() => {
    const loadRecents = async () => {
      try {
        setIsLoading(true);
        const recents = await loadRecentEmojis();
        setRecentEmojis(recents);
      } catch (error) {
        console.error('Failed to load recent emojis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecents();
  }, []);

  const handleEmojiPress = useCallback(
    async (emoji: string) => {
      // Add to recent emojis
      const updated = await addRecentEmoji(emoji);
      if (updated.length > 0) {
        setRecentEmojis(updated);
      }

      // Notify parent
      onEmojiSelect(emoji);
    },
    [onEmojiSelect]
  );

  const renderEmoji = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.emojiButton}
        onPress={() => handleEmojiPress(item)}
        activeOpacity={0.6}>
        <Text style={styles.emoji}>{item}</Text>
      </TouchableOpacity>
    ),
    [handleEmojiPress]
  );

  const renderCategoryTab = useCallback(
    (category: (typeof EMOJI_CATEGORIES)[0]) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryTab,
          selectedCategory === category.id && styles.categoryTabActive,
        ]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.7}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
      </TouchableOpacity>
    ),
    [selectedCategory]
  );

  // Get current category with updated recents
  const currentCategory = getCategoryWithRecents(
    selectedCategory,
    recentEmojis
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A884" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Emoji Grid */}
      <FlatList
        data={currentCategory?.emojis || []}
        renderItem={renderEmoji}
        keyExtractor={(item, index) => `${selectedCategory}-${index}`}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.emojiGrid}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={50}
        windowSize={10}
        initialNumToRender={40}
      />

      {/* Bottom Category Bar */}
      <View style={styles.bottomBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          {EMOJI_CATEGORIES.map(renderCategoryTab)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B141A',
  },
  emojiGrid: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },
  emojiButton: {
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#2A3942',
    backgroundColor: '#1F2C34',
  },
  categoryScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  categoryTab: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryTabActive: {
    backgroundColor: '#2A3942',
  },
  categoryIcon: {
    fontSize: 24,
  },
});
