import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { STICKER_PACKS } from '../data/stickerData';
import { Sticker } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const STICKER_SIZE = Math.floor((width - 32) / 4);

interface Props {
  onStickerSelect: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<Props> = ({ onStickerSelect }) => {
  const [selectedPack, setSelectedPack] = useState(STICKER_PACKS[0].id);
  const currentPack = STICKER_PACKS.find(p => p.id === selectedPack);

  const handlePress = useCallback(
    (s: Sticker) => onStickerSelect(s),
    [onStickerSelect]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={currentPack?.stickers || []}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={12}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.stickerBtn}
            onPress={() => handlePress(item)}
            activeOpacity={0.6}>
            <View style={styles.stickerInner}>
              <Image
                source={{ uri: item.image }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.bottomBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packScroll}>
          {STICKER_PACKS.map(pack => (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packTab,
                selectedPack === pack.id && styles.packTabActive,
              ]}
              onPress={() => setSelectedPack(pack.id)}
              activeOpacity={0.7}>
              <Text style={styles.packIcon}>{pack.icon}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' },
  grid: { paddingHorizontal: 8, paddingTop: 8 },
  stickerBtn: { width: STICKER_SIZE, height: STICKER_SIZE, padding: 4 },
  stickerInner: {
    flex: 1,
    backgroundColor: '#1F2C34',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#2A3942',
    backgroundColor: '#1F2C34',
  },
  packScroll: { paddingVertical: 8, paddingHorizontal: 8, gap: 8 },
  packTab: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  packTabActive: { backgroundColor: '#2A3942' },
  packIcon: { fontSize: 26 },
});
