import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {STICKER_PACKS} from '../data/stickerData';
import type {Sticker} from '../types/inputTypes';

const NUM_COLUMNS = 4;
const TAB_BAR_HEIGHT = 48;

interface StickerPickerProps {
  height: number;
  onStickerSelect: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  height,
  onStickerSelect,
}) => {
  const {width} = useWindowDimensions();
  const cellSize = Math.floor(width / NUM_COLUMNS);
  const [packId, setPackId] = useState(STICKER_PACKS[0].id);
  const pack = STICKER_PACKS.find(p => p.id === packId) ?? STICKER_PACKS[0];

  const renderItem = useCallback(
    ({item}: {item: Sticker}) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Send sticker ${item.emoji}`}
        style={({pressed}) => [
          styles.cell,
          {width: cellSize, height: cellSize},
          pressed && styles.cellPressed,
        ]}
        onPress={() => onStickerSelect(item)}>
        <Text style={[styles.sticker, {fontSize: cellSize * 0.55}]}>
          {item.emoji}
        </Text>
      </Pressable>
    ),
    [cellSize, onStickerSelect],
  );

  return (
    <View style={[styles.container, {height}]}>
      <FlatList
        key={packId}
        data={pack.stickers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        style={styles.grid}
        keyboardShouldPersistTaps="always"
      />
      <View style={[styles.tabBar, {height: TAB_BAR_HEIGHT}]}>
        {STICKER_PACKS.map(p => (
          <Pressable
            key={p.id}
            accessibilityRole="tab"
            accessibilityLabel={p.name}
            accessibilityState={{selected: p.id === packId}}
            style={[styles.tab, p.id === packId && styles.tabActive]}
            onPress={() => setPackId(p.id)}>
            <Text style={styles.tabIcon}>{p.icon}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  grid: {
    flex: 1,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cellPressed: {
    backgroundColor: '#F0F2F5',
  },
  sticker: {
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D7DB',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#E7F8EE',
  },
  tabIcon: {
    fontSize: 20,
  },
});
