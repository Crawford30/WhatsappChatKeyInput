export enum InputMode {
  TEXT = 'TEXT',
  EMOJI = 'EMOJI',
  STICKER = 'STICKER',
  VOICE = 'VOICE',
  CAMERA = 'CAMERA',
}

export type AttachmentKind = 'image' | 'document' | 'audio';

export interface Attachment {
  kind: AttachmentKind;
  uri: string;
  name: string;
  size?: number | null;
  mimeType?: string | null;
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'attachment';
  duration?: number; // for voice messages
  attachment?: Attachment;
  fromMe?: boolean; // defaults to true (sent from this device)
  viewOnce?: boolean;
  viewOnceOpened?: boolean;
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
