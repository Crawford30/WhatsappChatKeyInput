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
import {
  EMOJI_CATEGORIES,
  getPreferredTone,
  getRecentEmojis,
  setPreferredTone,
  SKIN_TONE_COUNT,
  TONE_ENABLED,
  withSkinTone,
} from '../data/emojiData';
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

const TONE_OPTION_SIZE = 44;

interface ToneTarget {
  emoji: string;
  /** Where the long-pressed cell is, relative to the picker */
  x: number;
  y: number;
}

const EmojiRow = memo(
  ({
    emojis,
    size,
    onPress,
    onLongPress,
    rowOffset,
  }: {
    emojis: string[];
    size: number;
    onPress: (emoji: string) => void;
    /** Long-pressed cell's column and the row's offset in the list */
    onLongPress: (emoji: string, column: number, rowOffset: number) => void;
    rowOffset: number;
    /** Re-renders the row when a remembered tone changes */
    toneVersion: number;
  }) => (
    <View style={themeStyles.flexRow}>
      {emojis.map((emoji, index) => {
        const toned = TONE_ENABLED.has(emoji);
        const shown = toned
          ? withSkinTone(emoji, getPreferredTone(emoji))
          : emoji;
        return (
          <Pressable
            key={`${emoji}-${index}`}
            accessibilityLabel={shown}
            accessibilityHint={toned ? 'Long press for skin tones' : undefined}
            style={({ pressed }) => [
              themeStyles.flexCenter,
              { width: size, height: size },
              pressed && styles.pressed,
            ]}
            delayLongPress={300}
            onPress={() => onPress(shown)}
            onLongPress={
              toned ? () => onLongPress(emoji, index, rowOffset) : undefined
            }>
            <Text style={styles.emoji}>{shown}</Text>
            {toned && <View style={styles.toneMark} />}
          </Pressable>
        );
      })}
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
  const scrollY = useRef(0);
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);
  const [toneTarget, setToneTarget] = useState<ToneTarget | null>(null);
  const [toneVersion, setToneVersion] = useState(0);

  // Long press: open the tone bubble over the cell. Rows have fixed
  // heights, so the cell's position follows from its row and column.
  const openTones = useCallback(
    (emoji: string, column: number, rowOffset: number) =>
      setToneTarget({
        emoji,
        x: column * cellSize,
        y: rowOffset - scrollY.current,
      }),
    [cellSize]
  );

  const pickTone = useCallback(
    (tone: number) => {
      if (!toneTarget) return;
      setPreferredTone(toneTarget.emoji, tone);
      setToneVersion(version => version + 1);
      setToneTarget(null);
      onEmojiSelect(withSkinTone(toneTarget.emoji, tone));
    },
    [toneTarget, onEmojiSelect]
  );

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
      scrollY.current = nativeEvent.contentOffset.y;
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
    ({ item, index }: { item: Item; index: number }) =>
      item.type === 'header' ? (
        <Text style={styles.sectionTitle}>{item.title}</Text>
      ) : (
        <EmojiRow
          emojis={item.emojis}
          size={cellSize}
          onPress={onEmojiSelect}
          onLongPress={openTones}
          rowOffset={offsets[index] ?? 0}
          toneVersion={toneVersion}
        />
      ),
    [cellSize, onEmojiSelect, openTones, offsets, toneVersion]
  );

  const renderToneBubble = () => {
    if (!toneTarget) return null;
    const bubbleWidth = (SKIN_TONE_COUNT + 1) * TONE_OPTION_SIZE + 12;
    const left = Math.min(
      Math.max(toneTarget.x + cellSize / 2 - bubbleWidth / 2, 6),
      width - bubbleWidth - 6
    );
    const top = Math.max(toneTarget.y - TONE_OPTION_SIZE - 16, 4);
    return (
      <>
        <Pressable
          accessibilityLabel="Close skin tones"
          style={StyleSheet.absoluteFill}
          onPress={() => setToneTarget(null)}
        />
        <View style={[themeStyles.flexRow, styles.toneBubble, { left, top }]}>
          {Array.from({ length: SKIN_TONE_COUNT + 1 }, (_, tone) => (
            <Pressable
              key={tone}
              accessibilityLabel={`Skin tone ${tone}`}
              style={({ pressed }) => [
                themeStyles.flexCenter,
                styles.toneOption,
                (pressed || getPreferredTone(toneTarget.emoji) === tone) &&
                  styles.pressed,
              ]}
              onPress={() => pickTone(tone)}>
              <Text style={styles.emoji}>
                {withSkinTone(toneTarget.emoji, tone)}
              </Text>
            </Pressable>
          ))}
        </View>
      </>
    );
  };

  return (
    <View style={themeStyles.flex1}>
      <FlatList
        ref={listRef}
        data={items}
        extraData={toneVersion}
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

      {renderToneBubble()}
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
  // Small corner triangle marking emoji that have skin tones
  toneMark: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: colorAlpha(configSecondary).shade50,
  },
  toneBubble: {
    position: 'absolute',
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'white',
    elevation: 6,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  toneOption: {
    width: TONE_OPTION_SIZE,
    height: TONE_OPTION_SIZE,
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
