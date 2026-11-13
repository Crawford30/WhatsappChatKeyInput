import type {StickerPack} from '../types/inputTypes';

// Emoji stickers render offline and at any size. (The previous placeholder
// images came from placekitten.com, which no longer serves images.)
const pack = (id: string, name: string, icon: string, emojis: string[]) => ({
  id,
  name,
  icon,
  stickers: emojis.map((emoji, i) => ({id: `${id}-${i}`, emoji, pack: id})),
});

export const STICKER_PACKS: StickerPack[] = [
  pack('animals', 'Cute Animals', '🐱', [
    '🐱', '🐶', '🐼', '🦊', '🐨', '🐯', '🦁', '🐸',
    '🐵', '🐧', '🐤', '🦄', '🐙', '🐢', '🐰', '🐻',
  ]),
  pack('faces', 'Funny Faces', '😂', [
    '😂', '🤣', '😜', '🤪', '😎', '🥳', '🤯', '😱',
    '🥺', '😴', '🤓', '🙃', '😈', '🤡', '👻', '💩',
  ]),
  pack('love', 'Love', '❤️', [
    '❤️', '😍', '🥰', '😘', '💕', '💖', '💌', '🌹',
    '💐', '💍', '🫶', '💞', '😻', '💘', '💝', '🤗',
  ]),
  pack('reactions', 'Reactions', '👍', [
    '👍', '👎', '👏', '🙌', '🙏', '💯', '🔥', '🎉',
    '✅', '❌', '👀', '🤝', '💪', '🤷', '🤦', '😮',
  ]),
];
