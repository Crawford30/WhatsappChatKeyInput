import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, FontSizes, Layout } from '../Helpers/constants';

const { width } = Dimensions.get('window');

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  visible: boolean;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'recent',
    name: 'Recent',
    icon: '🕐',
    emojis: ['😂', '❤️', '😍', '🤣', '😊', '🙏', '💕', '😭'],
  },
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😊',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '🙃',
      '😉',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😗',
      '😚',
      '😙',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🤐',
      '🤨',
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👋',
      '🤚',
      '🖐️',
      '✋',
      '🖖',
      '👌',
      '🤏',
      '✌️',
      '🤞',
      '🤟',
      '🤘',
      '🤙',
      '👈',
      '👉',
      '👆',
      '🖕',
      '👇',
      '☝️',
      '👍',
      '👎',
      '✊',
      '👊',
      '🤛',
      '🤜',
      '👏',
      '🙌',
      '👐',
      '🤲',
      '🤝',
      '🙏',
      '✍️',
      '💅',
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    emojis: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🐤',
      '🦆',
      '🦅',
      '🦉',
      '🦇',
      '🐺',
      '🐗',
      '🐴',
      '🦄',
      '🐝',
      '🐛',
      '🦋',
      '🐌',
      '🐞',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍔',
    emojis: [
      '🍏',
      '🍎',
      '🍐',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🍓',
      '🍈',
      '🍒',
      '🍑',
      '🥭',
      '🍍',
      '🥥',
      '🥝',
      '🍅',
      '🍆',
      '🥑',
      '🥦',
      '🥬',
      '🥒',
      '🌶️',
      '🌽',
      '🥕',
      '🥔',
      '🍠',
      '🥐',
      '🥯',
      '🍞',
      '🥖',
      '🥨',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🥎',
      '🎾',
      '🏐',
      '🏉',
      '🥏',
      '🎱',
      '🪀',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
      '🏏',
      '🥅',
      '⛳',
      '🪁',
      '🏹',
      '🎣',
      '🤿',
      '🥊',
      '🥋',
      '🎽',
      '🛹',
      '🛷',
      '⛸️',
      '🥌',
      '🎿',
      '⛷️',
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    emojis: [
      '🚗',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🏎️',
      '🚓',
      '🚑',
      '🚒',
      '🚐',
      '🚚',
      '🚛',
      '🚜',
      '🦯',
      '🦽',
      '🦼',
      '🛴',
      '🚲',
      '🛵',
      '🏍️',
      '🛺',
      '🚨',
      '🚔',
      '🚍',
      '🚘',
      '🚖',
      '🚡',
      '🚠',
      '🚟',
      '🚃',
      '🚋',
      '🚞',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '💡',
    emojis: [
      '⌚',
      '📱',
      '📲',
      '💻',
      '⌨️',
      '🖥️',
      '🖨️',
      '🖱️',
      '🖲️',
      '🕹️',
      '🗜️',
      '💾',
      '💿',
      '📀',
      '📼',
      '📷',
      '📸',
      '📹',
      '🎥',
      '📽️',
      '🎞️',
      '📞',
      '☎️',
      '📟',
      '📠',
      '📺',
      '📻',
      '🎙️',
      '🎚️',
      '🎛️',
      '🧭',
      '⏱️',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '💟',
      '☮️',
      '✝️',
      '☪️',
      '🕉️',
      '☸️',
      '✡️',
      '🔯',
      '🕎',
      '☯️',
      '☦️',
      '🛐',
      '⛎',
      '♈',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🏁',
    emojis: [
      '🏁',
      '🚩',
      '🎌',
      '🏴',
      '🏳️',
      '🏳️‍🌈',
      '🏴‍☠️',
      '🇺🇳',
      '🇦🇫',
      '🇦🇽',
      '🇦🇱',
      '🇩🇿',
      '🇦🇸',
      '🇦🇩',
      '🇦🇴',
      '🇦🇮',
      '🇦🇶',
      '🇦🇬',
      '🇦🇷',
      '🇦🇲',
      '🇦🇼',
      '🇦🇺',
      '🇦🇹',
      '🇦🇿',
      '🇧🇸',
      '🇧🇭',
      '🇧🇩',
      '🇧🇧',
      '🇧🇾',
      '🇧🇪',
      '🇧🇿',
      '🇧🇯',
    ],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  visible,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('recent');

  if (!visible) return null;

  const currentCategory = EMOJI_CATEGORIES.find(
    cat => cat.id === selectedCategory
  );

  return (
    <View style={styles.container}>
      {/* Emoji Grid */}
      <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiWrapper}>
          {currentCategory?.emojis.map((emoji, index) => (
            <TouchableOpacity
              key={`${emoji}-${index}`}
              style={styles.emojiButton}
              onPress={() => onEmojiSelect(emoji)}
              activeOpacity={0.6}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Category Bar */}
      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          {EMOJI_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350,
    backgroundColor: Colors.panelBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emojiGrid: {
    flex: 1,
  },
  emojiWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
  },
  emojiButton: {
    width: width / 8,
    height: width / 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  categoryBar: {
    height: 50,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.categoryBarBackground,
  },
  categoryScrollContent: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  categoryButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: Colors.highlight,
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: 22,
  },
});

// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import { EMOJI_CATEGORIES, addRecentEmoji } from '../data/emojiData';

// const { width } = Dimensions.get('window');
// const EMOJI_SIZE = width / 8;
// const NUM_COLUMNS = 8;

// interface EmojiPickerProps {
//   onEmojiSelect: (emoji: string) => void;
// }

// export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
//   const [selectedCategory, setSelectedCategory] = useState(
//     EMOJI_CATEGORIES[0].id
//   );

//   const currentCategory = EMOJI_CATEGORIES.find(
//     cat => cat.id === selectedCategory
//   );

//   const handleEmojiPress = useCallback(
//     (emoji: string) => {
//       addRecentEmoji(emoji);
//       onEmojiSelect(emoji);
//     },
//     [onEmojiSelect]
//   );

//   const renderEmoji = useCallback(
//     ({ item }: { item: string }) => (
//       <TouchableOpacity
//         style={styles.emojiButton}
//         onPress={() => handleEmojiPress(item)}
//         activeOpacity={0.6}>
//         <Text style={styles.emoji}>{item}</Text>
//       </TouchableOpacity>
//     ),
//     [handleEmojiPress]
//   );

//   const renderCategoryTab = useCallback(
//     (category: (typeof EMOJI_CATEGORIES)[0]) => (
//       <TouchableOpacity
//         key={category.id}
//         style={[
//           styles.categoryTab,
//           selectedCategory === category.id && styles.categoryTabActive,
//         ]}
//         onPress={() => setSelectedCategory(category.id)}
//         activeOpacity={0.7}>
//         <Text style={styles.categoryIcon}>{category.icon}</Text>
//       </TouchableOpacity>
//     ),
//     [selectedCategory]
//   );

//   return (
//     <View style={styles.container}>
//       {/* Emoji Grid */}
//       <FlatList
//         data={currentCategory?.emojis || []}
//         renderItem={renderEmoji}
//         keyExtractor={(item, index) => `${selectedCategory}-${index}`}
//         numColumns={NUM_COLUMNS}
//         contentContainerStyle={styles.emojiGrid}
//         showsVerticalScrollIndicator={false}
//         removeClippedSubviews={true}
//         maxToRenderPerBatch={50}
//         windowSize={10}
//         initialNumToRender={40}
//       />

//       {/* Bottom Category Bar */}
//       <View style={styles.bottomBar}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.categoryScrollContent}>
//           {EMOJI_CATEGORIES.map(renderCategoryTab)}
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0B141A',
//   },
//   emojiGrid: {
//     paddingHorizontal: 4,
//     paddingTop: 8,
//     paddingBottom: 8,
//   },
//   emojiButton: {
//     width: EMOJI_SIZE,
//     height: EMOJI_SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emoji: {
//     fontSize: 28,
//   },
//   bottomBar: {
//     borderTopWidth: 1,
//     borderTopColor: '#2A3942',
//     backgroundColor: '#1F2C34',
//   },
//   categoryScrollContent: {
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//     gap: 4,
//   },
//   categoryTab: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   categoryTabActive: {
//     backgroundColor: '#2A3942',
//   },
//   categoryIcon: {
//     fontSize: 24,
//   },
// });
