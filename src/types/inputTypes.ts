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

/**
 * Where attachments come from. Each resolves to the picked files, or [] when
 * the user cancels. Supply your own to reuse existing picker libraries, or
 * use `defaultPickers` from '<package>/src/pickers'.
 */
export interface AttachmentPickers {
  openCamera: () => Promise<Attachment[]>;
  openGallery: () => Promise<Attachment[]>;
  pickDocument: () => Promise<Attachment[]>;
  pickAudio: () => Promise<Attachment[]>;
}

/** A finished recording from a VoiceRecorderAdapter */
export interface RecordedAudio {
  uri: string;
  /** Seconds */
  duration: number;
  mimeType?: string | null;
  name?: string;
}

/**
 * Plug a real audio recorder into ChatInput's hold-to-record button. The
 * input keeps its own recording UI (timer, waveform, slide to cancel) and
 * calls these; `stop` resolves to null when nothing usable was recorded.
 */
export interface VoiceRecorderAdapter {
  start: () => Promise<void>;
  stop: () => Promise<RecordedAudio | null>;
  cancel: () => Promise<void>;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'attachment' | 'sticker';
  duration?: number; // for voice messages
  attachment?: Attachment;
  sticker?: Sticker;
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

/** Either an image sticker (e.g. from a backend) or a built-in emoji sticker */
export interface Sticker {
  id: string;
  pack: string;
  image?: string;
  emoji?: string;
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
