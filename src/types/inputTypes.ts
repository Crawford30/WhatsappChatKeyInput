export enum InputMode {
  TEXT = 'TEXT',
  PANEL = 'PANEL',
  VOICE = 'VOICE',
}

export enum PanelType {
  EMOJI = 'EMOJI',
  GIF = 'GIF',
  STICKER = 'STICKER',
}

export enum RecordingState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPING = 'STOPPING',
  ERROR = 'ERROR',
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'sticker' | 'gif';
  duration?: number;
  uri?: string;
  stickerUri?: string;
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
  pack?: string;
  label?: string;
}

export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  iconIsImage?: boolean;
  stickers: Sticker[];
}

export interface AudioData {
  uri: string;
  type: string;
  name: string;
  duration: number;
  size: number;
}

export interface ChatInputProps {
  onSendMessage: (message: Message) => void;
  onSendAudio?: (audioData: AudioData) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  maxRecordingDuration?: number;
}
