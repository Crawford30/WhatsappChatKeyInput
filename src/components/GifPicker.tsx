import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Sticker } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const GIF_WIDTH = Math.floor((width - 24) / 2);

// Placeholder data – swap for Giphy/Tenor integration
const TRENDING: Sticker[] = Array.from({ length: 12 }, (_, i) => ({
  id: `gif-${i}`,
  image: `https://picsum.photos/seed/gif${i}/300/250`,
  pack: 'trending',
}));

interface Props {
  onGifSelect: (gif: Sticker) => void;
}

export const GifPicker: React.FC<Props> = ({ onGifSelect }) => {
  const [query, setQuery] = useState('');

  const handlePress = useCallback(
    (gif: Sticker) => onGifSelect(gif),
    [onGifSelect]
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search GIFs"
          placeholderTextColor="#8696A0"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={TRENDING}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.colWrapper}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const tall = index % 3 === 0;
          return (
            <TouchableOpacity
              style={[
                styles.gifBtn,
                { height: tall ? GIF_WIDTH * 1.35 : GIF_WIDTH },
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}>
              <Image
                source={{ uri: item.image }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by GIPHY</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 12,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 15, marginRight: 8, opacity: 0.7 },
  searchInput: { flex: 1, fontSize: 15, color: '#fff', padding: 0 },
  grid: { paddingHorizontal: 8, paddingTop: 4 },
  colWrapper: { justifyContent: 'space-between', paddingHorizontal: 4 },
  gifBtn: {
    width: GIF_WIDTH,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1F2C34',
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
    letterSpacing: 1,
  },
});
