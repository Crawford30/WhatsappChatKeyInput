/**
 * WhatsApp-style chat input: emoji/sticker keyboard, attachment menu,
 * photo editor and voice button.
 *
 * Built-in attachment pickers live in './pickers' so the native picker
 * libraries stay optional.
 */
export { ChatInput } from './components/ChatInput';
export type { ChatInputProps } from './components/ChatInput';

export { EmojiKeyboard } from './components/EmojiKeyboard';
export { EmojiPicker } from './components/EmojiPicker';
export { StickerPicker } from './components/StickerPicker';
export { StickerView } from './components/StickerView';
export { AttachmentMenu } from './components/AttachmentMenu';
export { MessageBubble } from './components/MessageBubble';
export { MediaEditor } from './components/media/MediaEditor';
export type { EditedImage } from './components/media/MediaEditor';
export { MediaViewer } from './components/media/MediaViewer';

export { useEmojiKeyboard } from './hooks/useEmojiKeyboard';
export { insertAtSelection, deleteBackward } from './Helpers/emojiInput';
export { STICKER_PACKS } from './data/stickerData';

export type {
  Attachment,
  AttachmentKind,
  AttachmentPickers,
  Message,
  Sticker,
  StickerPack,
} from './types/inputTypes';
