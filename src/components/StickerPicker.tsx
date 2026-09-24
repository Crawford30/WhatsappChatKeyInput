import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colorAlpha, primaryColor } from '../assets/style/Colors';
import { STICKER_PACKS } from '../data/stickerData';
import type { Sticker } from '../types/inputTypes';
import { StickerView } from './StickerView';

export const DEFAULT_STICKER_SIZE = 64;
export const DEFAULT_STICKER_COLUMNS = 4;

const GRID_PADDING = 4;
const CELL_PADDING = 8;

interface StickerPickerProps {
  onStickerSelect: (sticker: Sticker) => void;
  /** Sticker width and height (default 64); shrinks if the cell is narrower */
  size?: number;
  /** Stickers per row (default 4) */
  columns?: number;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onStickerSelect,
  size = DEFAULT_STICKER_SIZE,
  columns = DEFAULT_STICKER_COLUMNS,
}) => {
  const { width } = useWindowDimensions();
  const numColumns = Math.max(1, Math.floor(columns));
  const cellWidth = Math.floor((width - GRID_PADDING * 2) / numColumns);
  const stickerSize = Math.max(
    16,
    Math.min(size, cellWidth - CELL_PADDING * 2)
  );
  const cellHeight = stickerSize + CELL_PADDING * 2;

  const [selectedPack, setSelectedPack] = useState(STICKER_PACKS[0].id);

  const currentPack = STICKER_PACKS.find(pack => pack.id === selectedPack);

  const handleStickerPress = useCallback(
    (sticker: Sticker) => {
      onStickerSelect(sticker);
    },
    [onStickerSelect]
  );

  const renderSticker = useCallback(
    ({ item }: { item: Sticker }) => (
      <TouchableOpacity
        style={[styles.stickerButton, { width: cellWidth, height: cellHeight }]}
        onPress={() => handleStickerPress(item)}
        activeOpacity={0.6}>
        <StickerView sticker={item} size={stickerSize} />
      </TouchableOpacity>
    ),
    [handleStickerPress, cellWidth, cellHeight, stickerSize]
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
        activeOpacity={0.7}>
        <Text style={styles.packIcon}>{pack.icon}</Text>
      </TouchableOpacity>
    ),
    [selectedPack]
  );

  return (
    <View style={styles.container}>
      <FlatList
        key={numColumns}
        data={currentPack?.stickers || []}
        renderItem={renderSticker}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.stickerGrid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
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
    flex: 1,
  },
  stickerGrid: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 8,
  },
  stickerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  packBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  packTab: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    marginHorizontal: 2,
  },
  packTabActive: {
    backgroundColor: colorAlpha(primaryColor).shade10,
  },
  packIcon: {
    fontSize: 24,
  },
});
