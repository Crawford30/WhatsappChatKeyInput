import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { EMOJI_CATEGORIES, getRecentEmojis } from '../data/emojiData';
import {
  colorAlpha,
  configSecondary,
  primaryColor,
} from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { EmojiSVG } from '../assets/svg/EmojiSVG';
import {
  ActivitySVG,
  AnimalSVG,
  FlagOutlineSVG,
  FoodSVG,
  ObjectSVG,
  RecentSVG,
  SymbolSVG,
  TravelSVG,
} from '../assets/svg/EmojiCategorySVG';

const NUM_COLUMNS = 9;
const HEADER_HEIGHT = 40;
const CATEGORY_ICON_SIZE = 22;

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  recent: RecentSVG,
  smileys: EmojiSVG,
  animals: AnimalSVG,
  food: FoodSVG,
  activity: ActivitySVG,
  travel: TravelSVG,
  objects: ObjectSVG,
  symbols: SymbolSVG,
  flags: FlagOutlineSVG,
};

type Item =
  | { type: 'header'; key: string; sectionId: string; title: string }
  | { type: 'row'; key: string; sectionId: string; emojis: string[] };

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  /** Change to re-read the recents (e.g. each time the panel opens) */
  refreshKey?: number;
}

const EmojiRow = memo(
  ({
    emojis,
    size,
    onPress,
  }: {
    emojis: string[];
    size: number;
    onPress: (emoji: string) => void;
  }) => (
    <View style={themeStyles.flexRow}>
      {emojis.map((emoji, index) => (
        <Pressable
          key={`${emoji}-${index}`}
          style={({ pressed }) => [
            themeStyles.flexCenter,
            { width: size, height: size },
            pressed && styles.pressed,
          ]}
          onPress={() => onPress(emoji)}>
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </View>
  )
);

/**
 * Emoji grid with section headers and a category bar that follows the
 * scroll. Rows are virtualised with fixed heights, so opening the panel only
 * renders what's on screen, even on slow devices.
 */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  refreshKey = 0,
}) => {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(width / NUM_COLUMNS);

  const listRef = useRef<FlatList<Item>>(null);
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);

  const { items, offsets, sectionStarts, sections } = useMemo(() => {
    const list: Item[] = [];
    const itemOffsets: number[] = [];
    const starts: {
      id: string;
      title: string;
      offset: number;
      index: number;
    }[] = [];
    let offset = 0;

    EMOJI_CATEGORIES.forEach(category => {
      const emojis =
        category.id === 'recent' ? getRecentEmojis() : category.emojis;
      if (!emojis.length) return;
      const title = category.id === 'recent' ? 'Recents' : category.name;

      starts.push({ id: category.id, title, offset, index: list.length });
      itemOffsets.push(offset);
      list.push({
        type: 'header',
        key: `h-${category.id}`,
        sectionId: category.id,
        title,
      });
      offset += HEADER_HEIGHT;

      for (let i = 0; i < emojis.length; i += NUM_COLUMNS) {
        itemOffsets.push(offset);
        list.push({
          type: 'row',
          key: `r-${category.id}-${i}`,
          sectionId: category.id,
          emojis: emojis.slice(i, i + NUM_COLUMNS),
        });
        offset += cellSize;
      }
    });

    return {
      items: list,
      offsets: itemOffsets,
      sectionStarts: starts,
      sections: starts.map(({ id, title }) => ({ id, title })),
    };
    // refreshKey re-reads recents when the panel reopens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize, refreshKey]);

  const getItemLayout = useCallback(
    (_: ArrayLike<Item> | null | undefined, index: number) => ({
      length: items[index]?.type === 'header' ? HEADER_HEIGHT : cellSize,
      offset: offsets[index] ?? 0,
      index,
    }),
    [items, offsets, cellSize]
  );

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = nativeEvent.contentOffset.y + 1;
      let current = sectionStarts[0]?.id;
      for (const section of sectionStarts) {
        if (section.offset <= y) current = section.id;
      }
      if (current) setActiveCategory(current);
    },
    [sectionStarts]
  );

  const scrollToCategory = useCallback(
    (id: string) => {
      const section = sectionStarts.find(s => s.id === id);
      if (!section) return;
      setActiveCategory(id);
      listRef.current?.scrollToOffset({
        offset: section.offset,
        animated: false,
      });
    },
    [sectionStarts]
  );

  const renderItem = useCallback(
    ({ item }: { item: Item }) =>
      item.type === 'header' ? (
        <Text style={styles.sectionTitle}>{item.title}</Text>
      ) : (
        <EmojiRow
          emojis={item.emojis}
          size={cellSize}
          onPress={onEmojiSelect}
        />
      ),
    [cellSize, onEmojiSelect]
  );

  return (
    <View style={themeStyles.flex1}>
      <FlatList
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          themeStyles.flexRow,
          themeStyles.borderTop,
          styles.categoryBar,
        ]}>
        {sections.map(section => {
          const Icon = CATEGORY_ICONS[section.id] ?? EmojiSVG;
          const active = activeCategory === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              accessibilityLabel={section.title}
              style={[
                themeStyles.flex1,
                themeStyles.flexCenter,
                styles.categoryTab,
                active && styles.categoryTabActive,
              ]}
              onPress={() => scrollToCategory(section.id)}
              activeOpacity={0.7}>
              <Icon
                width={CATEGORY_ICON_SIZE}
                height={CATEGORY_ICON_SIZE}
                color={active ? primaryColor : configSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emoji: {
    fontSize: 28,
  },
  pressed: {
    backgroundColor: colorAlpha(primaryColor).shade10,
    borderRadius: 8,
  },
  sectionTitle: {
    height: HEADER_HEIGHT,
    fontSize: 14,
    fontWeight: '600',
    color: configSecondary,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  categoryBar: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  categoryTab: {
    height: 38,
    borderRadius: 19,
    marginHorizontal: 2,
  },
  categoryTabActive: {
    backgroundColor: colorAlpha(primaryColor).shade10,
  },
});
