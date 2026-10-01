import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  colorAlpha,
  configSecondary,
  primaryColor,
} from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { ArrowBackSVG } from '../assets/svg/ArrowBackSVG';
import { CloseSVG } from '../assets/svg/CloseSVG';
import {
  getPreferredTone,
  getRecentEmojis,
  searchEmojis,
  TONE_ENABLED,
  withSkinTone,
} from '../data/emojiData';

const RESULT_SIZE = 46;

interface EmojiSearchProps {
  height: number;
  onEmojiSelect: (emoji: string) => void;
  /** Leave search (back to the emoji panel) */
  onClose: () => void;
}

/**
 * WhatsApp-style emoji search: a field and a row of results that sit above
 * the keyboard. Picking a result inserts it into the message and keeps
 * searching; an empty query shows recent emoji.
 */
export const EmojiSearch: React.FC<EmojiSearchProps> = ({
  height,
  onEmojiSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const found = query.trim() ? searchEmojis(query) : getRecentEmojis();
    // Show tone-enabled results in the user's remembered tone
    return found.map(emoji =>
      TONE_ENABLED.has(emoji)
        ? withSkinTone(emoji, getPreferredTone(emoji))
        : emoji
    );
  }, [query]);

  return (
    <View style={[styles.container, { height }]}>
      <View style={[themeStyles.flexRow, themeStyles.flexNullCenter]}>
        <TouchableOpacity
          accessibilityLabel="Close emoji search"
          style={[themeStyles.flexCenter, styles.iconButton]}
          onPress={onClose}>
          <ArrowBackSVG width={22} height={22} color={configSecondary} />
        </TouchableOpacity>
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search emoji"
          placeholderTextColor="#9E9E9E"
          selectionColor={primaryColor}
          returnKeyType="search"
          autoCorrect={false}
          style={[themeStyles.flex1, styles.input]}
        />
        {!!query && (
          <TouchableOpacity
            accessibilityLabel="Clear search"
            style={[themeStyles.flexCenter, styles.iconButton]}
            onPress={() => setQuery('')}>
            <CloseSVG width={16} height={16} color={configSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {results.length ? (
        <FlatList
          horizontal
          data={results}
          keyExtractor={(emoji, index) => `${emoji}-${index}`}
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.results}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={item}
              style={({ pressed }) => [
                themeStyles.flexCenter,
                styles.result,
                pressed && styles.pressed,
              ]}
              onPress={() => onEmojiSelect(item)}>
              <Text style={styles.emoji}>{item}</Text>
            </Pressable>
          )}
        />
      ) : (
        <Text style={styles.empty}>No emoji found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 6,
    paddingHorizontal: 6,
  },
  iconButton: {
    width: 40,
    height: 44,
  },
  input: {
    height: 44,
    fontSize: 16,
    color: 'black',
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: colorAlpha(configSecondary).shade10,
  },
  results: {
    alignItems: 'center',
    paddingTop: 4,
  },
  result: {
    width: RESULT_SIZE,
    height: RESULT_SIZE,
  },
  pressed: {
    backgroundColor: colorAlpha(primaryColor).shade10,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 28,
  },
  empty: {
    textAlign: 'center',
    color: configSecondary,
    fontSize: 14,
    paddingTop: 16,
  },
});
