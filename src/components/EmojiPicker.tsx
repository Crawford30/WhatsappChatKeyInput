import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
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

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
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
    <TouchableOpacity
      style={[themeStyles.flexCenter, { width: size, height: size }]}
      onPress={() => onPress(emoji)}
      activeOpacity={0.5}>
      <Text style={styles.emoji}>{emoji}</Text>
    </TouchableOpacity>
  )
);

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(width / NUM_COLUMNS);

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id);

  // Snapshot recents on open so the grid doesn't reshuffle while tapping
  const sections = useMemo(
    () =>
      EMOJI_CATEGORIES.map(category => ({
        ...category,
        title: category.id === 'recent' ? 'Recents' : category.name,
        emojis: category.id === 'recent' ? getRecentEmojis() : category.emojis,
      })).filter(section => section.emojis.length > 0),
    []
  );

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = nativeEvent.contentOffset.y + 1;
      let current = sections[0].id;
      for (const section of sections) {
        if ((sectionOffsets.current[section.id] ?? Infinity) <= y) {
          current = section.id;
        }
      }
      setActiveCategory(current);
    },
    [sections]
  );

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    scrollRef.current?.scrollTo({
      y: sectionOffsets.current[id] ?? 0,
      animated: false,
    });
  }, []);

  return (
    <View style={themeStyles.flex1}>
      <ScrollView
        ref={scrollRef}
        style={themeStyles.flex1}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <View
            key={section.id}
            onLayout={event => {
              sectionOffsets.current[section.id] = event.nativeEvent.layout.y;
            }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={[themeStyles.flexRow, themeStyles.flexWrap]}>
              {section.emojis.map((emoji, index) => (
                <EmojiCell
                  key={`${section.id}-${index}`}
                  emoji={emoji}
                  size={cellSize}
                  onPress={onEmojiSelect}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: configSecondary,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
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
