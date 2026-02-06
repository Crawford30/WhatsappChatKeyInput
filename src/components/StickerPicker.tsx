import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../Helpers/constants';

const { width } = Dimensions.get('window');

interface StickerPack {
  id: string;
  name: string;
  stickers: string[];
  thumbnail: string;
}

interface StickerPickerProps {
  visible: boolean;
  onStickerSelect: (sticker: string) => void;
  onCreateSticker: () => void;
}

// Sample sticker packs (replace with your actual sticker data)
const STICKER_PACKS: StickerPack[] = [
  {
    id: 'recent',
    name: 'Recent',
    thumbnail: '⭐',
    stickers: ['😂', '❤️', '👍', '🔥', '🎉', '💯', '✨', '🌟'],
  },
  {
    id: 'pack1',
    name: 'Pack 1',
    thumbnail: '😊',
    stickers: [
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
    ],
  },
  {
    id: 'pack2',
    name: 'Pack 2',
    thumbnail: '🐶',
    stickers: [
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
      '🐽',
      '🐸',
      '🐵',
    ],
  },
];

export const StickerPicker: React.FC<StickerPickerProps> = ({
  visible,
  onStickerSelect,
  onCreateSticker,
}) => {
  const [selectedPack, setSelectedPack] = useState('recent');

  if (!visible) return null;

  const currentPack = STICKER_PACKS.find(pack => pack.id === selectedPack);

  return (
    <View style={styles.container}>
      {/* Sticker Grid */}
      <ScrollView
        style={styles.stickerGrid}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stickerWrapper}>
          {/* Create Sticker Button */}
          <TouchableOpacity
            style={styles.createStickerButton}
            onPress={onCreateSticker}
            activeOpacity={0.7}>
            <View style={styles.createIconContainer}>
              <Text style={styles.createIcon}>+</Text>
            </View>
            <Text style={styles.createLabel}>Create</Text>
          </TouchableOpacity>

          {/* Stickers */}
          {currentPack?.stickers.map((sticker, index) => (
            <TouchableOpacity
              key={`${sticker}-${index}`}
              style={styles.stickerButton}
              onPress={() => onStickerSelect(sticker)}
              activeOpacity={0.6}>
              <Text style={styles.sticker}>{sticker}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Pack Selector Bar */}
      <View style={styles.packBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packScrollContent}>
          {STICKER_PACKS.map(pack => (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.packButton,
                selectedPack === pack.id && styles.packButtonActive,
              ]}
              onPress={() => setSelectedPack(pack.id)}
              activeOpacity={0.7}>
              <View style={styles.packThumbnail}>
                <Text style={styles.packIcon}>{pack.thumbnail}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Add Pack Button */}
          <TouchableOpacity style={styles.addPackButton} activeOpacity={0.7}>
            <Text style={styles.addPackIcon}>+</Text>
          </TouchableOpacity>
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
  stickerGrid: {
    flex: 1,
  },
  stickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
  },
  createStickerButton: {
    width: width / 4,
    height: width / 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  createIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  createLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  stickerButton: {
    width: width / 4,
    height: width / 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  sticker: {
    fontSize: 72,
  },
  packBar: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.categoryBarBackground,
  },
  packScrollContent: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  packButton: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  packButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  packThumbnail: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packIcon: {
    fontSize: 32,
  },
  addPackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    borderStyle: 'dashed',
  },
  addPackIcon: {
    fontSize: 24,
    color: Colors.textSecondary,
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
// import { STICKER_PACKS } from '../data/stickerData';
// import type { Sticker } from '../types/inputTypes';

// const { width } = Dimensions.get('window');
// const STICKER_SIZE = (width - 32) / 4;
// const NUM_COLUMNS = 4;

// interface StickerPickerProps {
//   onStickerSelect: (sticker: Sticker) => void;
// }

// export const StickerPicker: React.FC<StickerPickerProps> = ({
//   onStickerSelect,
// }) => {
//   const [selectedPack, setSelectedPack] = useState(STICKER_PACKS[0].id);

//   const currentPack = STICKER_PACKS.find(pack => pack.id === selectedPack);

//   const handleStickerPress = useCallback(
//     (sticker: Sticker) => {
//       onStickerSelect(sticker);
//     },
//     [onStickerSelect]
//   );

//   const renderSticker = useCallback(
//     ({ item }: { item: Sticker }) => (
//       <TouchableOpacity
//         style={styles.stickerButton}
//         onPress={() => handleStickerPress(item)}
//         activeOpacity={0.6}>
//         <View style={styles.stickerImageContainer}>
//           {/* Display sticker icon as text for now */}
//           <Text style={styles.stickerPlaceholder}>
//             {item.pack === 'pack1'
//               ? '🐱'
//               : item.pack === 'pack2'
//               ? '😂'
//               : item.pack === 'pack3'
//               ? '❤️'
//               : '👍'}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     ),
//     [handleStickerPress]
//   );

//   const renderPackTab = useCallback(
//     (pack: (typeof STICKER_PACKS)[0]) => {
//       const isActive = selectedPack === pack.id;

//       return (
//         <TouchableOpacity
//           key={pack.id}
//           style={[styles.packTab, isActive && styles.packTabActive]}
//           onPress={() => setSelectedPack(pack.id)}
//           activeOpacity={0.7}>
//           <View style={styles.packIconContainer}>
//             <Text style={styles.packIcon}>{pack.icon}</Text>
//           </View>
//           {isActive && <View style={styles.packActiveIndicator} />}
//         </TouchableOpacity>
//       );
//     },
//     [selectedPack]
//   );

//   // Header with Create button
//   const renderHeader = useCallback(
//     () => (
//       <View style={styles.headerContainer}>
//         <View style={styles.createSection}>
//           <TouchableOpacity style={styles.createButton} activeOpacity={0.7}>
//             <View style={styles.createIconCircle}>
//               <Text style={styles.createIcon}>✏️</Text>
//             </View>
//             <Text style={styles.createText}>Create</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     ),
//     []
//   );

//   return (
//     <View style={styles.container}>
//       {/* Stickers Grid */}
//       <FlatList
//         data={currentPack?.stickers || []}
//         renderItem={renderSticker}
//         keyExtractor={item => item.id}
//         numColumns={NUM_COLUMNS}
//         ListHeaderComponent={renderHeader}
//         contentContainerStyle={styles.stickerGrid}
//         showsVerticalScrollIndicator={false}
//         removeClippedSubviews={true}
//         maxToRenderPerBatch={20}
//         windowSize={5}
//         initialNumToRender={16}
//       />

//       {/* Bottom Pack Bar */}
//       <View style={styles.bottomBar}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.packScrollContent}>
//           {STICKER_PACKS.map(renderPackTab)}
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
//   headerContainer: {
//     paddingTop: 12,
//     paddingBottom: 8,
//     width: '100%',
//   },
//   createSection: {
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   createButton: {
//     alignItems: 'center',
//     width: STICKER_SIZE - 16,
//   },
//   createIconCircle: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#00A884',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   createIcon: {
//     fontSize: 24,
//   },
//   createText: {
//     fontSize: 13,
//     color: '#8696A0',
//     fontWeight: '500',
//   },
//   stickerGrid: {
//     paddingHorizontal: 8,
//   },
//   stickerButton: {
//     width: STICKER_SIZE,
//     height: STICKER_SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 8,
//   },
//   stickerImageContainer: {
//     width: STICKER_SIZE - 16,
//     height: STICKER_SIZE - 16,
//     backgroundColor: '#1F2C34',
//     borderRadius: 8,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stickerPlaceholder: {
//     fontSize: 48,
//   },
//   bottomBar: {
//     borderTopWidth: 1,
//     borderTopColor: '#2A3942',
//     backgroundColor: '#1F2C34',
//   },
//   packScrollContent: {
//     paddingVertical: 8,
//     paddingHorizontal: 8,
//     gap: 8,
//   },
//   packTab: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 8,
//   },
//   packTabActive: {
//     // Active styling handled by indicator
//   },
//   packIconContainer: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   packIcon: {
//     fontSize: 28,
//   },
//   packActiveIndicator: {
//     position: 'absolute',
//     bottom: -8,
//     left: '50%',
//     marginLeft: -15,
//     width: 30,
//     height: 3,
//     backgroundColor: '#00A884',
//     borderRadius: 2,
//   },
// });
