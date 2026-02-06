export enum InputMode {
  TEXT = 'TEXT',
  PANEL = 'PANEL', // Unified panel for emoji/sticker/gif
  VOICE = 'VOICE',
  CAMERA = 'CAMERA',
}

export enum PanelType {
  EMOJI = 'EMOJI',
  GIF = 'GIF',
  STICKER = 'STICKER',
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image';
  duration?: number; // for voice messages
}

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export interface Sticker {
  id: string;
  image: string;
  pack: string;
}

export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  stickers: Sticker[];
}

export interface VoiceRecording {
  isRecording: boolean;
  duration: number;
  amplitude: number[];
  uri?: string;
}
