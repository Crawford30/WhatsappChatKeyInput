# @dev-tech/uchat-chat-input

WhatsApp-style chat input for React Native:

- Emoji keyboard that swaps with the system keyboard at the same height, with recents, categories and whole-emoji backspace
- Sticker tab (offline emoji packs, or image URLs)
- Attachment menu (document, camera, gallery, audio)
- Photo editor: crop & rotate, draw, text, emoji stickers, captions, view once
- Send / hold-to-record mic button (or your own recorder)

The package ships TypeScript source, like `@dev-tech/uchat-shared-lib`. Metro compiles it, so there's no build step.

## Install

```sh
yarn add @dev-tech/uchat-chat-input@git+ssh://git@github.com/Crawford30/WhatsappChatKeyInput.git
```

Peer dependencies your app must have:

| Package | Needed for |
| --- | --- |
| `react-native-svg` | icons |
| `react-native-safe-area-context` | bottom inset |
| `react-native-view-shot` | exporting edited photos |
| `react-native-image-picker` *(optional)* | `defaultPickers` camera and gallery |
| `@react-native-documents/picker` *(optional)* | `defaultPickers` documents and audio |

The two optional pickers are only needed if you use `defaultPickers`. **Don't install `@react-native-documents/picker` next to the older `react-native-document-picker`.** Both register a native module called `RNDocumentPicker`. In that case pass your own `pickers` instead.

After adding native packages, rebuild the app (`yarn android`, `cd ios && pod install`).

Android: the activity needs `android:windowSoftInputMode="adjustResize"`. On iOS the input reserves the keyboard space itself, so don't also wrap it in a `KeyboardAvoidingView`.

## Usage

```tsx
import { ChatInput, Message } from '@dev-tech/uchat-chat-input';
import { defaultPickers } from '@dev-tech/uchat-chat-input/src/pickers';

<ChatInput
  recipientName="Stephen"
  onSendMessage={(message: Message) => send(message)}
  pickers={defaultPickers}
/>;
```

`onSendMessage` receives one of:

| `type` | Fields |
| --- | --- |
| `text` | `text` |
| `attachment` | `attachment` (`kind`: image / document / audio, `uri`, `name`, `mimeType`, `size`), `text` as caption, `viewOnce` |
| `sticker` | `sticker` (`emoji` or `image`) |
| `voice` | `duration` (built-in recorder only) |

### Props

| Prop | Description |
| --- | --- |
| `onSendMessage` | Required. Called for every text, file, sticker or voice note |
| `recipientName` | Required. Shown in the photo editor's send row |
| `value` / `onChangeText` | Control the text yourself (e.g. for @mentions). Omit both and the input manages its own text |
| `inputRef` | Your own `TextInput` ref |
| `onSelectionChange` / `onFocus` | Forwarded to the `TextInput` |
| `header` | Rendered inside the pill above the text, e.g. a reply preview |
| `pickers` | `{ openCamera, openGallery, pickDocument, pickAudio }`, each resolving to `Attachment[]` (`[]` when cancelled). Without it the clip and camera buttons are hidden |
| `voiceButton` | Replaces the mic button while the input is empty. **The built-in recorder only simulates recording**, so pass a real one |
| `stickers` | Show the sticker tab (default `true`) |
| `placeholder` | Defaults to `Message` |

Also exported: `MessageBubble`, `StickerView`, `MediaEditor`, `MediaViewer`, `EmojiKeyboard`, `EmojiPicker`, `StickerPicker`, `AttachmentMenu`, `useEmojiKeyboard`, `insertAtSelection`, `deleteBackward`, `STICKER_PACKS`.

### Using it in uchat

[`integration/uchat/MessagesScreen.tsx`](integration/uchat/MessagesScreen.tsx) is uchat's `MessagesScreen` with its input area replaced by `ChatInput`. It keeps the existing `handleSendMessage`, @mentions, `ReplyBubble` and `VoiceRecorder`. Before shipping it, check `toUchatAttachments` against what the old `DocumentPicker` sent.

## Developing

This repo is also a demo app (`App.tsx` → `src/screens/ChatScreen.tsx`).

```sh
yarn install
yarn android        # or: cd ios && pod install && yarn ios
yarn test
```
