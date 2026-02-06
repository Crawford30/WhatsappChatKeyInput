import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { EMOJI_CATEGORIES, addRecentEmoji } from '../data/emojiData';

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

  const currentCategory = EMOJI_CATEGORIES.find(
    cat => cat.id === selectedCategory
  );

  const handleEmojiPress = useCallback(
    (emoji: string) => {
      addRecentEmoji(emoji);
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
