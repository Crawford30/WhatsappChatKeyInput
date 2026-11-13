/** What occupies the area below the input bar. */
export type InputMode = 'idle' | 'keyboard' | 'emoji' | 'sticker';

export type Message =
  | {id: string; fromMe: boolean; timestamp: Date; type: 'text'; text: string}
  | {id: string; fromMe: boolean; timestamp: Date; type: 'sticker'; sticker: string}
  | {id: string; fromMe: boolean; timestamp: Date; type: 'voice'; durationMs: number};

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export interface Sticker {
  id: string;
  /** Rendered large, like a sticker. Works offline, no image downloads. */
  emoji: string;
  pack: string;
}

export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  stickers: Sticker[];
}
