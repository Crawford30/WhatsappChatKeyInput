import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import type { Sticker } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const GIF_SIZE = (width - 24) / 2;

// Placeholder GIF data - in real app, integrate with Giphy/Tenor API
const TRENDING_GIFS = [
  {
    id: 'gif-1',
    image: 'https://picsum.photos/300/300?random=1',
    pack: 'trending',
  },
  {
    id: 'gif-2',
    image: 'https://picsum.photos/300/400?random=2',
    pack: 'trending',
  },
  {
    id: 'gif-3',
    image: 'https://picsum.photos/300/350?random=3',
    pack: 'trending',
  },
  {
    id: 'gif-4',
    image: 'https://picsum.photos/300/300?random=4',
    pack: 'trending',
  },
  {
    id: 'gif-5',
    image: 'https://picsum.photos/300/400?random=5',
    pack: 'trending',
  },
  {
    id: 'gif-6',
    image: 'https://picsum.photos/300/350?random=6',
    pack: 'trending',
  },
  {
    id: 'gif-7',
    image: 'https://picsum.photos/300/300?random=7',
    pack: 'trending',
  },
  {
    id: 'gif-8',
    image: 'https://picsum.photos/300/400?random=8',
    pack: 'trending',
  },
];

interface GifPickerProps {
  onGifSelect: (gif: Sticker) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onGifSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleGifPress = useCallback(
    (gif: Sticker) => {
      onGifSelect(gif);
    },
    [onGifSelect]
  );

  const renderGif = useCallback(
    ({ item, index }: { item: Sticker; index: number }) => {
      // Vary heights for masonry-like effect
      const isOddRow = Math.floor(index / 2) % 2 === 1;
      const isLeftColumn = index % 2 === 0;
      const shouldBeTaller =
        (isOddRow && isLeftColumn) || (!isOddRow && !isLeftColumn);
      const gifHeight = shouldBeTaller ? GIF_SIZE * 1.3 : GIF_SIZE;

      return (
        <TouchableOpacity
          style={[styles.gifButton, { height: gifHeight }]}
          onPress={() => handleGifPress(item)}
          activeOpacity={0.6}>
          <Image
            source={{ uri: item.image }}
            style={styles.gifImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    },
    [handleGifPress]
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIconText}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search GIFs"
          placeholderTextColor="#8696A0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* GIF Grid */}
      <FlatList
        data={TRENDING_GIFS}
        renderItem={renderGif}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.gifGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Powered by Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by GIPHY</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 12,
    marginBottom: 8,
  },
  searchIconText: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  gifGrid: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  gifButton: {
    width: GIF_SIZE,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1F2C34',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A3942',
    backgroundColor: '#1F2C34',
  },
  footerText: {
    fontSize: 10,
    color: '#8696A0',
    fontWeight: '600',
  },
});
