import { StickerPack } from '../types/inputTypes';

// Built-in packs are emoji art so they work offline. Packs from a server can
// use `image` URLs instead: { id, pack, image: 'https://…/sticker.webp' }
const emojiPack = (
  id: string,
  name: string,
  icon: string,
  emojis: string[],
): StickerPack => ({
  id,
  name,
  icon,
  stickers: emojis.map((emoji, i) => ({ id: `${id}-${i}`, pack: id, emoji })),
});

export const STICKER_PACKS: StickerPack[] = [
  emojiPack('animals', 'Cute Animals', '🐱', [
    '🐱', '🐶', '🐼', '🦊', '🐨', '🐯', '🦁', '🐸',
    '🐵', '🙈', '🐧', '🦄', '🐰', '🐻', '🐷', '🐥',
  ]),
  emojiPack('faces', 'Funny Faces', '😂', [
    '😂', '🤣', '😜', '🤪', '😎', '🥳', '🤯', '😱',
    '🥺', '😭', '😴', '🤔', '🙄', '😏', '🤡', '👻',
  ]),
  emojiPack('love', 'Love', '❤️', [
    '❤️', '😍', '🥰', '😘', '💕', '💖', '💘', '💐',
    '🌹', '💌', '🫶', '💞', '😻', '💝', '💋', '🤗',
  ]),
  emojiPack('reactions', 'Reactions', '👍', [
    '👍', '👏', '🙌', '🙏', '💪', '🔥', '💯', '🎉',
    '👌', '✌️', '🤝', '👀', '✅', '❌', '⭐', '🏆',
  ]),
];
