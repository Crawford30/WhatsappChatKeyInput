/**
 * StickerPicker.tsx
 *
 * Fixes vs previous version:
 *  • STICKER_SIZE now accounts for cell padding so 4 cols always fill the width
 *  • Image onError → coloured fallback view so grid never shows blank cells
 *  • getAllPacks() called inside component so recent/favourites stay reactive
 *  • Default pack is first non-empty one (skips empty recent/favourites)
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { StickerStore, Sticker, StickerPack } from '../data/stickerData';

const { width: SCREEN_W } = Dimensions.get('window');

const NUM_COLS = 4;
const CELL_PAD = 4; // padding inside each cell
const GRID_H_PAD = 8; // FlatList horizontal padding
// total width consumed by padding: outer * 2 + inner gaps between 4 cols
const STICKER_SIZE = Math.floor(
  (SCREEN_W - GRID_H_PAD * 2) / NUM_COLS - CELL_PAD * 2
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onStickerSelect: (sticker: Sticker) => void;
  onCreatePress?: () => void;
  onAddPackPress?: () => void;
}

// ─── Image with fallback ──────────────────────────────────────────────────────

const StickerImage: React.FC<{ uri: string; size: number; tint: string }> = ({
  uri,
  size,
  tint,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          backgroundColor: tint,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ fontSize: 20 }}>🖼️</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: 8 }}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
};

// ─── Sticker cell ─────────────────────────────────────────────────────────────

const TINTS = ['#FF6B6B40', '#FFD93D40', '#6BCB7740', '#4D96FF40', '#C77DFF40'];

const StickerCell = React.memo(
  ({
    sticker,
    index,
    onPress,
    onLongPress,
    isFavourite,
  }: {
    sticker: Sticker;
    index: number;
    onPress: (s: Sticker) => void;
    onLongPress: (s: Sticker) => void;
    isFavourite: boolean;
  }) => {
    const scale = useRef(new Animated.Value(1)).current;

    return (
      <TouchableWithoutFeedback
        onPress={() => onPress(sticker)}
        onLongPress={() => onLongPress(sticker)}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.88,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
        }
        delayLongPress={400}>
        <Animated.View style={[styles.cell, { transform: [{ scale }] }]}>
          <StickerImage
            uri={sticker.image}
            size={STICKER_SIZE}
            tint={TINTS[index % TINTS.length]}
          />
          {isFavourite && (
            <View style={styles.favBadge}>
              <Text style={styles.favStar}>★</Text>
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
);

// ─── Create cell ──────────────────────────────────────────────────────────────

const CreateCell: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.7}>
    <View
      style={[
        styles.createInner,
        { width: STICKER_SIZE, height: STICKER_SIZE },
      ]}>
      <Text style={styles.createPencil}>✏️</Text>
      <Text style={styles.createLabel}>Create</Text>
    </View>
  </TouchableOpacity>
);

// ─── Pack tab ─────────────────────────────────────────────────────────────────

const PackTab = React.memo(
  ({
    pack,
    isActive,
    onPress,
  }: {
    pack: StickerPack;
    isActive: boolean;
    onPress: (id: string) => void;
  }) => (
    <TouchableOpacity
      style={[styles.packTab, isActive && styles.packTabActive]}
      onPress={() => onPress(pack.id)}
      activeOpacity={0.7}>
      {pack.iconIsImage ? (
        <Image source={{ uri: pack.icon }} style={styles.packTabImage} />
      ) : (
        <Text style={styles.packTabIcon}>{pack.icon}</Text>
      )}
      {isActive && <View style={styles.packTabIndicator} />}
    </TouchableOpacity>
  )
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>🗂️</Text>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

type GridItem = Sticker | { id: '__create__' };

export const StickerPicker: React.FC<Props> = ({
  onStickerSelect,
  onCreatePress,
  onAddPackPress,
}) => {
  const allPacks = StickerStore.getAllPacks();

  const defaultPack =
    allPacks.find(p => p.stickers.length > 0)?.id ?? allPacks[0].id;

  const [selectedPackId, setSelectedPackId] = useState(defaultPack);
  const [tick, setTick] = useState(0); // force re-render after fav toggle

  const currentPack = allPacks.find(p => p.id === selectedPackId);

  const handleStickerPress = useCallback(
    (sticker: Sticker) => {
      StickerStore.addRecent(sticker);
      onStickerSelect(sticker);
    },
    [onStickerSelect]
  );

  const handleLongPress = useCallback((sticker: Sticker) => {
    StickerStore.toggleFavourite(sticker);
    setTick(n => n + 1);
  }, []);

  const handlePackSelect = useCallback((id: string) => {
    setSelectedPackId(id);
  }, []);

  const gridData: GridItem[] = [
    { id: '__create__' },
    ...(currentPack?.stickers ?? []),
  ];

  const renderItem = useCallback(
    ({ item, index }: { item: GridItem; index: number }) => {
      if (item.id === '__create__') {
        return <CreateCell onPress={onCreatePress} />;
      }
      const s = item as Sticker;
      return (
        <StickerCell
          sticker={s}
          index={index}
          onPress={handleStickerPress}
          onLongPress={handleLongPress}
          isFavourite={StickerStore.isFavourite(s.id)}
        />
      );
    },
    [handleStickerPress, handleLongPress, onCreatePress, tick]
  );

  const emptyMsg =
    selectedPackId === 'recent'
      ? 'No recently used stickers'
      : selectedPackId === 'favourites'
      ? 'Long-press any sticker to favourite it'
      : 'No stickers in this pack';

  return (
    <View style={styles.container}>
      {gridData.length <= 1 ? (
        <EmptyState message={emptyMsg} />
      ) : (
        <FlatList
          data={gridData}
          keyExtractor={item => item.id}
          numColumns={NUM_COLS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={16}
          maxToRenderPerBatch={16}
          windowSize={5}
          renderItem={renderItem}
        />
      )}

      {/* Pack tab bar */}
      <View style={styles.bottomBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packScroll}>
          {allPacks.map(pack => (
            <PackTab
              key={pack.id}
              pack={pack}
              isActive={selectedPackId === pack.id}
              onPress={handlePackSelect}
            />
          ))}
          <TouchableOpacity
            style={[styles.packTab, styles.addPackBtn]}
            onPress={onAddPackPress}
            activeOpacity={0.7}>
            <Text style={styles.addPackIcon}>⊕</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B141A' },

  grid: {
    paddingHorizontal: GRID_H_PAD,
    paddingTop: 8,
    paddingBottom: 8,
  },

  cell: {
    width: STICKER_SIZE + CELL_PAD * 2,
    height: STICKER_SIZE + CELL_PAD * 2,
    padding: CELL_PAD,
  },

  createInner: {
    borderRadius: 8,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  createPencil: { fontSize: 22 },
  createLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  favBadge: {
    position: 'absolute',
    top: CELL_PAD + 2,
    right: CELL_PAD + 2,
    backgroundColor: 'rgba(0,168,132,0.9)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  favStar: { fontSize: 9, color: '#fff', lineHeight: 12 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 40,
  },
  emptyIcon: { fontSize: 40, opacity: 0.4 },
  emptyText: {
    fontSize: 14,
    color: '#8696A0',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#2A3942',
    backgroundColor: '#1F2C34',
  },
  packScroll: { paddingVertical: 6, paddingHorizontal: 4 },
  packTab: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    position: 'relative',
  },
  packTabActive: { backgroundColor: '#2A3942' },
  packTabIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#00A884',
    borderRadius: 1,
  },
  packTabIcon: { fontSize: 24 },
  packTabImage: { width: 32, height: 32, borderRadius: 6 },
  addPackBtn: {
    borderWidth: 1.5,
    borderColor: '#2A3942',
    borderStyle: 'dashed',
  },
  addPackIcon: { fontSize: 22, color: '#8696A0' },
});

// /**
//  * StickerPicker.tsx
//  *
//  * WhatsApp-style sticker picker with:
//  *  • 4-column sticker grid
//  *  • Long-press → favourite toggle (star overlay)
//  *  • Bottom pack-tab bar (emoji icon or image thumbnail)
//  *  • "Create" button (first slot in every pack grid)
//  *  • "Add packs" (+) button in the tab bar
//  *  • Recent & Favourites packs auto-populated via StickerStore
//  *
//  * Props
//  * ─────
//  *  onStickerSelect  – called when the user taps a sticker
//  *  onCreatePress    – called when the user taps the "Create" button
//  *  onAddPackPress   – called when the user taps the "+" add-pack button
//  */

// import React, { useState, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
//   Image,
//   Animated,
// } from 'react-native';
// import {
//   STICKER_PACKS,
//   StickerStore,
//   Sticker,
//   StickerPack,
// } from '../data/stickerData';

// const { width: SCREEN_W } = Dimensions.get('window');

// // 4 columns with 8-px horizontal padding on each side and 4-px gaps
// const GRID_PADDING = 8;
// const GAP = 4;
// const NUM_COLS = 4;
// const STICKER_SIZE = Math.floor(
//   (SCREEN_W - GRID_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS
// );

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface Props {
//   onStickerSelect: (sticker: Sticker) => void;
//   onCreatePress?: () => void;
//   onAddPackPress?: () => void;
// }

// // ─── Sticker cell ─────────────────────────────────────────────────────────────

// interface StickerCellProps {
//   sticker: Sticker;
//   onPress: (s: Sticker) => void;
//   onLongPress: (s: Sticker) => void;
//   isFavourite: boolean;
// }

// const StickerCell: React.FC<StickerCellProps> = React.memo(
//   ({ sticker, onPress, onLongPress, isFavourite }) => {
//     const scaleAnim = useRef(new Animated.Value(1)).current;

//     const handlePressIn = () =>
//       Animated.spring(scaleAnim, {
//         toValue: 0.88,
//         useNativeDriver: true,
//       }).start();
//     const handlePressOut = () =>
//       Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

//     return (
//       <TouchableWithoutFeedback
//         onPress={() => onPress(sticker)}
//         onLongPress={() => onLongPress(sticker)}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         delayLongPress={400}>
//         <Animated.View
//           style={[styles.stickerCell, { transform: [{ scale: scaleAnim }] }]}>
//           <Image
//             source={{ uri: sticker.image }}
//             style={styles.stickerImage}
//             resizeMode="cover"
//           />
//           {isFavourite && (
//             <View style={styles.favBadge}>
//               <Text style={styles.favStar}>★</Text>
//             </View>
//           )}
//         </Animated.View>
//       </TouchableWithoutFeedback>
//     );
//   }
// );

// // ─── "Create" cell (first slot in each pack) ──────────────────────────────────

// interface CreateCellProps {
//   onPress?: () => void;
// }

// const CreateCell: React.FC<CreateCellProps> = ({ onPress }) => (
//   <TouchableOpacity
//     style={[styles.stickerCell, styles.createCell]}
//     onPress={onPress}
//     activeOpacity={0.7}>
//     <View style={styles.createInner}>
//       <Text style={styles.createPencil}>✏️</Text>
//       <Text style={styles.createLabel}>Create</Text>
//     </View>
//   </TouchableOpacity>
// );

// // ─── Pack tab ─────────────────────────────────────────────────────────────────

// interface PackTabProps {
//   pack: StickerPack;
//   isActive: boolean;
//   onPress: (id: string) => void;
// }

// const PackTab: React.FC<PackTabProps> = React.memo(
//   ({ pack, isActive, onPress }) => (
//     <TouchableOpacity
//       style={[styles.packTab, isActive && styles.packTabActive]}
//       onPress={() => onPress(pack.id)}
//       activeOpacity={0.7}>
//       {pack.iconIsImage ? (
//         <Image source={{ uri: pack.icon }} style={styles.packTabImage} />
//       ) : (
//         <Text style={styles.packTabIcon}>{pack.icon}</Text>
//       )}
//       {isActive && <View style={styles.packTabIndicator} />}
//     </TouchableOpacity>
//   )
// );

// // ─── Empty state ──────────────────────────────────────────────────────────────

// const EmptyState: React.FC<{ message: string }> = ({ message }) => (
//   <View style={styles.emptyState}>
//     <Text style={styles.emptyIcon}>🗂️</Text>
//     <Text style={styles.emptyText}>{message}</Text>
//   </View>
// );

// // ─── Main component ───────────────────────────────────────────────────────────

// export const StickerPicker: React.FC<Props> = ({
//   onStickerSelect,
//   onCreatePress,
//   onAddPackPress,
// }) => {
//   const allPacks = StickerStore.getAllPacks();
//   const [selectedPackId, setSelectedPackId] = useState(
//     // Default to first non-empty pack (skip recent/favourites if empty)
//     allPacks.find(p => p.stickers.length > 0)?.id ?? allPacks[0].id
//   );
//   const [, forceUpdate] = useState(0); // to re-render after favourite toggle

//   const currentPack = allPacks.find(p => p.id === selectedPackId);

//   // ── Handlers ────────────────────────────────────────────────────────────

//   const handleStickerPress = useCallback(
//     (sticker: Sticker) => {
//       StickerStore.addRecent(sticker);
//       onStickerSelect(sticker);
//     },
//     [onStickerSelect]
//   );

//   const handleStickerLongPress = useCallback((sticker: Sticker) => {
//     StickerStore.toggleFavourite(sticker);
//     forceUpdate(n => n + 1);
//   }, []);

//   const handlePackSelect = useCallback((packId: string) => {
//     setSelectedPackId(packId);
//   }, []);

//   // ── Grid data: prepend a "Create" sentinel ───────────────────────────────

//   type GridItem = Sticker | { id: '__create__' };

//   const gridData: GridItem[] = [
//     { id: '__create__' },
//     ...(currentPack?.stickers ?? []),
//   ];

//   // ── Render ──────────────────────────────────────────────────────────────

//   const renderItem = useCallback(
//     ({ item }: { item: GridItem }) => {
//       if (item.id === '__create__') {
//         return <CreateCell onPress={onCreatePress} />;
//       }
//       const sticker = item as Sticker;
//       return (
//         <StickerCell
//           sticker={sticker}
//           onPress={handleStickerPress}
//           onLongPress={handleStickerLongPress}
//           isFavourite={StickerStore.isFavourite(sticker.id)}
//         />
//       );
//     },
//     [handleStickerPress, handleStickerLongPress, onCreatePress]
//   );

//   const emptyMessage =
//     selectedPackId === 'recent'
//       ? 'No recently used stickers'
//       : selectedPackId === 'favourites'
//       ? 'Long-press any sticker to favourite it'
//       : 'No stickers in this pack';

//   return (
//     <View style={styles.container}>
//       {/* ── Sticker grid ── */}
//       {gridData.length <= 1 ? (
//         <EmptyState message={emptyMessage} />
//       ) : (
//         <FlatList
//           data={gridData}
//           keyExtractor={item => item.id}
//           numColumns={NUM_COLS}
//           contentContainerStyle={styles.grid}
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews
//           initialNumToRender={16}
//           maxToRenderPerBatch={16}
//           windowSize={5}
//           renderItem={renderItem}
//         />
//       )}

//       {/* ── Pack tab bar ── */}
//       <View style={styles.bottomBar}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.packScroll}>
//           {allPacks.map(pack => (
//             <PackTab
//               key={pack.id}
//               pack={pack}
//               isActive={selectedPackId === pack.id}
//               onPress={handlePackSelect}
//             />
//           ))}

//           {/* Add-pack (+) button */}
//           <TouchableOpacity
//             style={[styles.packTab, styles.addPackBtn]}
//             onPress={onAddPackPress}
//             activeOpacity={0.7}>
//             <Text style={styles.addPackIcon}>⊕</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0B141A',
//   },

//   // ── Grid ──────────────────────────────────────────────────────────────────
//   grid: {
//     paddingHorizontal: GRID_PADDING,
//     paddingTop: 8,
//     paddingBottom: 8,
//   },

//   stickerCell: {
//     width: STICKER_SIZE,
//     height: STICKER_SIZE,
//     padding: GAP / 2,
//   },

//   stickerImage: {
//     flex: 1,
//     borderRadius: 8,
//     backgroundColor: '#1F2C34',
//   },

//   favBadge: {
//     position: 'absolute',
//     top: 2,
//     right: 2,
//     backgroundColor: 'rgba(0,168,132,0.85)',
//     borderRadius: 8,
//     paddingHorizontal: 3,
//     paddingVertical: 1,
//   },

//   favStar: {
//     fontSize: 9,
//     color: '#fff',
//     lineHeight: 12,
//   },

//   // ── Create cell ───────────────────────────────────────────────────────────
//   createCell: {
//     padding: GAP / 2,
//   },

//   createInner: {
//     flex: 1,
//     borderRadius: 8,
//     backgroundColor: '#00A884',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 4,
//   },

//   createPencil: {
//     fontSize: 20,
//   },

//   createLabel: {
//     fontSize: 11,
//     fontWeight: '700',
//     color: '#fff',
//     letterSpacing: 0.3,
//   },

//   // ── Empty state ───────────────────────────────────────────────────────────
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 12,
//     paddingBottom: 40,
//   },

//   emptyIcon: {
//     fontSize: 40,
//     opacity: 0.4,
//   },

//   emptyText: {
//     fontSize: 14,
//     color: '#8696A0',
//     textAlign: 'center',
//     paddingHorizontal: 32,
//   },

//   // ── Bottom pack bar ───────────────────────────────────────────────────────
//   bottomBar: {
//     borderTopWidth: 1,
//     borderTopColor: '#2A3942',
//     backgroundColor: '#1F2C34',
//   },

//   packScroll: {
//     paddingVertical: 6,
//     paddingHorizontal: 4,
//   },

//   packTab: {
//     width: 48,
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//     marginHorizontal: 2,
//     position: 'relative',
//   },

//   packTabActive: {
//     backgroundColor: '#2A3942',
//   },

//   packTabIndicator: {
//     position: 'absolute',
//     bottom: 2,
//     left: 8,
//     right: 8,
//     height: 2,
//     backgroundColor: '#00A884',
//     borderRadius: 1,
//   },

//   packTabIcon: {
//     fontSize: 24,
//   },

//   packTabImage: {
//     width: 32,
//     height: 32,
//     borderRadius: 6,
//   },

//   addPackBtn: {
//     borderWidth: 1.5,
//     borderColor: '#2A3942',
//     borderStyle: 'dashed',
//   },

//   addPackIcon: {
//     fontSize: 22,
//     color: '#8696A0',
//   },
// });
