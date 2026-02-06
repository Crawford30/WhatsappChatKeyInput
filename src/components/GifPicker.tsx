import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import type { Sticker } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const GIF_SIZE = width / 2 - 12;

// Placeholder GIF data - in real app, integrate with Giphy/Tenor API
const TRENDING_GIFS = Array.from({ length: 20 }, (_, i) => ({
  id: `gif-${i}`,
  image: `https://placekitten.com/300/30${i}`,
  pack: 'trending',
}));

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
    ({ item }: { item: Sticker }) => (
      <TouchableOpacity
        style={styles.gifButton}
        onPress={() => handleGifPress(item)}
        activeOpacity={0.6}>
        <Image
          source={{ uri: item.image }}
          style={styles.gifImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [handleGifPress]
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search GIFs</Text>
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

      {/* Powered by Tenor/Giphy */}
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
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#8696A0',
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
    height: GIF_SIZE,
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
