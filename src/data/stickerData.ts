export type { Sticker, StickerPack } from '../types/inputTypes';
import type { Sticker, StickerPack } from '../types/inputTypes';

// ─── Placeholder generator ────────────────────────────────────────────────────
// Swap these URLs for your real CDN paths in production.
function makePlaceholderStickers(
  packId: string,
  count: number,
  seedOffset = 0
): Sticker[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${packId}-${i + 1}`,
    image: `https://picsum.photos/seed/${packId}${i + seedOffset}/200/200`,
    pack: packId,
    label: `${packId} sticker ${i + 1}`,
  }));
}

// ─── Sticker Packs ────────────────────────────────────────────────────────────

export const STICKER_PACKS: StickerPack[] = [
  { id: 'recent', name: 'Recently Used', icon: '🕐', stickers: [] },
  { id: 'favourites', name: 'Favourites', icon: '⭐', stickers: [] },
  {
    id: 'animals',
    name: 'Animated Animals',
    icon: '🐱',
    stickers: makePlaceholderStickers('animals', 16, 10),
  },
  {
    id: 'funny',
    name: 'Funny Faces',
    icon: '😂',
    stickers: makePlaceholderStickers('funny', 16, 30),
  },
  {
    id: 'love',
    name: 'Love & Romance',
    icon: '❤️',
    stickers: makePlaceholderStickers('love', 16, 50),
  },
  {
    id: 'reactions',
    name: 'Reactions',
    icon: '👍',
    stickers: makePlaceholderStickers('reactions', 16, 70),
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '☕',
    stickers: makePlaceholderStickers('food', 16, 90),
  },
  {
    id: 'nature',
    name: 'Nature & Travel',
    icon: '🐢',
    stickers: makePlaceholderStickers('nature', 16, 110),
  },
  {
    id: 'celebrations',
    name: 'Celebrations',
    icon: '🎉',
    stickers: makePlaceholderStickers('celebrations', 16, 130),
  },
  {
    id: 'memes',
    name: 'My Memes',
    icon: '🤣',
    stickers: makePlaceholderStickers('memes', 12, 150),
  },
];

// ─── StickerStore ─────────────────────────────────────────────────────────────

const MAX_RECENT = 24;
const MAX_FAVOURITES = 48;

let _recent: Sticker[] = [];
let _favourites: Sticker[] = [];

export const StickerStore = {
  getRecent: (): Sticker[] => _recent,

  addRecent(sticker: Sticker): Sticker[] {
    _recent = [sticker, ..._recent.filter(s => s.id !== sticker.id)].slice(
      0,
      MAX_RECENT
    );
    const pack = STICKER_PACKS.find(p => p.id === 'recent');
    if (pack) pack.stickers = _recent;
    return _recent;
  },

  getFavourites: (): Sticker[] => _favourites,
  isFavourite: (id: string): boolean => _favourites.some(s => s.id === id),

  toggleFavourite(sticker: Sticker): Sticker[] {
    _favourites = StickerStore.isFavourite(sticker.id)
      ? _favourites.filter(s => s.id !== sticker.id)
      : [sticker, ..._favourites].slice(0, MAX_FAVOURITES);
    const pack = STICKER_PACKS.find(p => p.id === 'favourites');
    if (pack) pack.stickers = _favourites;
    return _favourites;
  },

  getAllPacks(): StickerPack[] {
    return STICKER_PACKS.map(pack => {
      if (pack.id === 'recent') return { ...pack, stickers: _recent };
      if (pack.id === 'favourites') return { ...pack, stickers: _favourites };
      return pack;
    });
  },

  getPack: (packId: string) => STICKER_PACKS.find(p => p.id === packId),

  addPack(pack: StickerPack): void {
    if (STICKER_PACKS.find(p => p.id === pack.id)) return;
    const idx = STICKER_PACKS.findIndex(p => p.id === 'memes');
    STICKER_PACKS.splice(idx === -1 ? STICKER_PACKS.length : idx, 0, pack);
  },

  removePack(packId: string): void {
    const idx = STICKER_PACKS.findIndex(p => p.id === packId);
    if (idx !== -1) STICKER_PACKS.splice(idx, 1);
  },
};

// import { StickerPack } from '../types/inputTypes';

// // In a real app, these would be actual image URIs
// export const STICKER_PACKS: StickerPack[] = [
//   {
//     id: 'pack1',
//     name: 'Cute Animals',
//     icon: '🐱',
//     stickers: Array.from({ length: 20 }, (_, i) => ({
//       id: `sticker-pack1-${i}`,
//       image: `https://placekitten.com/200/20${i}`,
//       pack: 'pack1',
//     })),
//   },
//   {
//     id: 'pack2',
//     name: 'Funny Faces',
//     icon: '😂',
//     stickers: Array.from({ length: 20 }, (_, i) => ({
//       id: `sticker-pack2-${i}`,
//       image: `https://placekitten.com/201/20${i}`,
//       pack: 'pack2',
//     })),
//   },
//   {
//     id: 'pack3',
//     name: 'Love',
//     icon: '❤️',
//     stickers: Array.from({ length: 20 }, (_, i) => ({
//       id: `sticker-pack3-${i}`,
//       image: `https://placekitten.com/202/20${i}`,
//       pack: 'pack3',
//     })),
//   },
//   {
//     id: 'pack4',
//     name: 'Reactions',
//     icon: '👍',
//     stickers: Array.from({ length: 20 }, (_, i) => ({
//       id: `sticker-pack4-${i}`,
//       image: `https://placekitten.com/203/20${i}`,
//       pack: 'pack4',
//     })),
//   },
// ];
