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
import { STICKER_PACKS } from '../data/stickerData';
import type { Sticker } from '../types/inputTypes';

const { width } = Dimensions.get('window');
const STICKER_SIZE = width / 4;
const NUM_COLUMNS = 4;

interface StickerPickerProps {
  onStickerSelect: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onStickerSelect,
}) => {
  const [selectedPack, setSelectedPack] = useState(STICKER_PACKS[0].id);

  const currentPack = STICKER_PACKS.find(pack => pack.id === selectedPack);

  const handleStickerPress = useCallback(
    (sticker: Sticker) => {
      onStickerSelect(sticker);
    },
    [onStickerSelect],
  );

  const renderSticker = useCallback(
    ({ item }: { item: Sticker }) => (
      <TouchableOpacity
        style={styles.stickerButton}
        onPress={() => handleStickerPress(item)}
        activeOpacity={0.6}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.stickerImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
    [handleStickerPress],
  );

  const renderPackTab = useCallback(
    (pack: (typeof STICKER_PACKS)[0]) => (
      <TouchableOpacity
        key={pack.id}
        style={[
          styles.packTab,
          selectedPack === pack.id && styles.packTabActive,
        ]}
        onPress={() => setSelectedPack(pack.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.packIcon}>{pack.icon}</Text>
      </TouchableOpacity>
    ),
    [selectedPack],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={currentPack?.stickers || []}
        renderItem={renderSticker}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.stickerGrid}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={5}
        initialNumToRender={16}
      />
      <View style={styles.packBar}>{STICKER_PACKS.map(renderPackTab)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350,
    backgroundColor: '#FFFFFF',
  },
  stickerGrid: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  stickerButton: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  stickerImage: {
    width: STICKER_SIZE - 16,
    height: STICKER_SIZE - 16,
  },
  packBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  packTab: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  packTabActive: {
    backgroundColor: '#E8E8E8',
  },
  packIcon: {
    fontSize: 24,
  },
});
