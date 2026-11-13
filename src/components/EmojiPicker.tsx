import React, {memo, useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {EMOJI_CATEGORIES} from '../data/emojiData';

const NUM_COLUMNS = 8;
const TAB_BAR_HEIGHT = 48;

interface EmojiPickerProps {
  /** Total height of the panel (the keyboard's height). */
  height: number;
  /** Most recently used first. */
  recents: string[];
  onEmojiSelect: (emoji: string) => void;
  onBackspace: () => void;
}

const EmojiCell = memo(
  ({
    emoji,
    size,
    onPress,
  }: {
    emoji: string;
    size: number;
    onPress: (emoji: string) => void;
  }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={emoji}
      style={({pressed}) => [
        styles.cell,
        {width: size, height: size},
        pressed && styles.cellPressed,
      ]}
      onPress={() => onPress(emoji)}>
      <Text style={styles.emoji}>{emoji}</Text>
    </Pressable>
  ),
);

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  height,
  recents,
  onEmojiSelect,
  onBackspace,
}) => {
  const {width} = useWindowDimensions();
  const cellSize = Math.floor(width / NUM_COLUMNS);
  const [categoryId, setCategoryId] = useState(
    recents.length ? 'recent' : EMOJI_CATEGORIES[1].id,
  );

  const emojis = useMemo(() => {
    if (categoryId === 'recent') {
      return recents;
    }
    return EMOJI_CATEGORIES.find(c => c.id === categoryId)?.emojis ?? [];
  }, [categoryId, recents]);

  const renderItem = useCallback(
    ({item}: {item: string}) => (
      <EmojiCell emoji={item} size={cellSize} onPress={onEmojiSelect} />
    ),
    [cellSize, onEmojiSelect],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: cellSize,
      offset: cellSize * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    [cellSize],
  );

  return (
    <View style={[styles.container, {height}]}>
      <FlatList
        key={categoryId}
        data={emojis}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={NUM_COLUMNS}
        getItemLayout={getItemLayout}
        style={styles.grid}
        initialNumToRender={NUM_COLUMNS * 6}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          <Text style={styles.empty}>Emoji you use will show up here</Text>
        }
      />
      <View style={[styles.tabBar, {height: TAB_BAR_HEIGHT}]}>
        {EMOJI_CATEGORIES.map(category => (
          <Pressable
            key={category.id}
            accessibilityRole="tab"
            accessibilityLabel={category.name}
            accessibilityState={{selected: categoryId === category.id}}
            style={[
              styles.tab,
              categoryId === category.id && styles.tabActive,
            ]}
            onPress={() => setCategoryId(category.id)}>
            <Text style={styles.tabIcon}>{category.icon}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete"
          style={styles.tab}
          onPress={onBackspace}
          onLongPress={onBackspace}
          delayLongPress={300}>
          <Text style={styles.backspace}>⌫</Text>
        </Pressable>
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
    borderRadius: 8,
  },
  cellPressed: {
    backgroundColor: '#F0F2F5',
  },
  emoji: {
    fontSize: 28,
  },
  empty: {
    textAlign: 'center',
    color: '#8696A0',
    marginTop: 40,
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
  backspace: {
    fontSize: 22,
    color: '#54656F',
  },
});
