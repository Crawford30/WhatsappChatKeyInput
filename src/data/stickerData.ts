import { StickerPack } from '../types/inputTypes';

// In a real app, these would be actual image URIs
export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'pack1',
    name: 'Cute Animals',
    icon: '🐱',
    stickers: Array.from({ length: 20 }, (_, i) => ({
      id: `sticker-pack1-${i}`,
      image: `https://placekitten.com/200/20${i}`,
      pack: 'pack1',
    })),
  },
  {
    id: 'pack2',
    name: 'Funny Faces',
    icon: '😂',
    stickers: Array.from({ length: 20 }, (_, i) => ({
      id: `sticker-pack2-${i}`,
      image: `https://placekitten.com/201/20${i}`,
      pack: 'pack2',
    })),
  },
  {
    id: 'pack3',
    name: 'Love',
    icon: '❤️',
    stickers: Array.from({ length: 20 }, (_, i) => ({
      id: `sticker-pack3-${i}`,
      image: `https://placekitten.com/202/20${i}`,
      pack: 'pack3',
    })),
  },
  {
    id: 'pack4',
    name: 'Reactions',
    icon: '👍',
    stickers: Array.from({ length: 20 }, (_, i) => ({
      id: `sticker-pack4-${i}`,
      image: `https://placekitten.com/203/20${i}`,
      pack: 'pack4',
    })),
  },
];
