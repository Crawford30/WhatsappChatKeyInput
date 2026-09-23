# @dev-tech/uchat-chat-input

WhatsApp-style chat input for React Native.

- **Emoji keyboard** that swaps with the system keyboard at the same height. The input bar stays put while one slides over the other. Includes recents, categories and whole-emoji backspace (flags, skin tones, joined emoji)
- **Stickers**: offline emoji packs, or your own image URLs
- **Attachment menu**: document, camera, gallery, audio
- **Photo editor**: crop and rotate, draw, text, emoji stickers, per-photo captions, view once
- **Send / hold-to-record mic button**, or plug in your own recorder

## Installation

```sh
yarn add @dev-tech/uchat-chat-input
```

### Peer dependencies

Install any your app doesn't already have:

```sh
yarn add react-native-svg react-native-safe-area-context \
  react-native-keyboard-controller react-native-reanimated \
  react-native-view-shot
```

| Package | Used for |
| --- | --- |
| `react-native-keyboard-controller` (≥ 1.12) | tracking the keyboard frame by frame |
| `react-native-reanimated` (≥ 3) | animating the space under the input |
| `react-native-svg` | icons |
| `react-native-safe-area-context` | bottom inset |
| `react-native-view-shot` | saving edited photos |
| `react-native-image-picker` *(optional)* | `defaultPickers`: camera and gallery |
| `@react-native-documents/picker` *(optional)* | `defaultPickers`: documents and audio |

The two pickers are only needed if you use `defaultPickers`. **Don't install `@react-native-documents/picker` alongside the older `react-native-document-picker`.** Both register a native module named `RNDocumentPicker`. If your app uses the old one, pass your own `pickers` instead (see below).

Then rebuild the native app: `cd ios && pod install`, then `yarn android` / `yarn ios`.

## Setup (once per app)

**1. Babel plugin.** Reanimated needs its Babel plugin, listed last:

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'], // Reanimated 4
  // plugins: ['react-native-reanimated/plugin'], // Reanimated 3
};
```

**2. `KeyboardProvider` at the root:**

```tsx
import { KeyboardProvider } from 'react-native-keyboard-controller';

<SafeAreaProvider>
  <KeyboardProvider enabled={false}>
    <App />
  </KeyboardProvider>
</SafeAreaProvider>;
```

`enabled={false}` keeps Android's normal `adjustResize` behaviour on every other screen. `ChatInput` switches keyboard tracking on while it's mounted and restores the previous setting when it unmounts.

**3. Restart Metro with a clean cache** after adding the Babel plugin:

```sh
yarn start --reset-cache
```

Android: keep `android:windowSoftInputMode="adjustResize"` on your activity. Don't wrap `ChatInput` in a `KeyboardAvoidingView`; it reserves the keyboard's space itself.

## Usage

```tsx
import { ChatInput, Message } from '@dev-tech/uchat-chat-input';
import { defaultPickers } from '@dev-tech/uchat-chat-input/src/pickers';

export function ChatScreen() {
  const send = (message: Message) => {
    // upload / append to your list
  };

  return (
    <View style={{ flex: 1 }}>
      <MessageList style={{ flex: 1 }} />
      <ChatInput
        recipientName="Stephen"
        onSendMessage={send}
        pickers={defaultPickers}
      />
    </View>
  );
}
```

Put `ChatInput` last in a full-height column. It sizes the space under itself for the keyboard, the emoji panel and the bottom safe-area inset.

### What `onSendMessage` receives

| `type` | Fields |
| --- | --- |
| `text` | `text` |
| `attachment` | `attachment` (`kind`: `image` / `document` / `audio`, `uri`, `name`, `mimeType`, `size`, `width`, `height`), `text` = caption, `viewOnce` |
| `sticker` | `sticker` (`emoji` or `image`) |
| `voice` | `duration` (seconds), `attachment` (`kind: 'audio'`) when a `recorder` is given |

Picked photos open in the photo editor first. Unedited photos are sent as the original file. Edited photos arrive as a new JPEG.

### Props

| Prop | Description |
| --- | --- |
| `onSendMessage` | **Required.** Called for every text, file, sticker or voice note |
| `recipientName` | **Required.** Shown on the photo editor's send row |
| `value`, `onChangeText` | Control the text yourself (needed for @mentions). Omit both and the input keeps its own text |
| `inputRef` | Your own `TextInput` ref |
| `onSelectionChange`, `onFocus` | Forwarded to the `TextInput` |
| `header` | Rendered inside the input above the text, e.g. a reply preview |
| `pickers` | `{ openCamera, openGallery, pickDocument, pickAudio }`, each returning `Promise<Attachment[]>` (`[]` when cancelled). Without it the clip and camera buttons are hidden |
| `recorder` | Your audio recorder, `{ start, stop, cancel }` (see below). The input keeps its own recording UI (timer, waveform, slide to cancel) and calls these. **Without it, recording is only simulated** |
| `voiceButton` | Replaces the whole mic button and its recording UI while the input is empty |
| `stickers` | Show the sticker tab (default `true`) |
| `placeholder` | Default `"Message"` |

### Using your own pickers

```tsx
const pickers: AttachmentPickers = {
  openCamera: async () => toAttachments(await myCamera()),
  openGallery: async () => toAttachments(await myGallery()),
  pickDocument: async () => toAttachments(await myFilePicker()),
  pickAudio: async () => toAttachments(await myFilePicker({ audio: true })),
};
```

### Using your own recorder

```tsx
const recorder: VoiceRecorderAdapter = {
  start: () => myRecorder.start(),
  // Resolve to null if nothing usable was recorded
  stop: async () => {
    const file = await myRecorder.stop();
    return file && { uri: file.uri, duration: file.seconds, mimeType: 'audio/m4a' };
  },
  cancel: () => myRecorder.cancel(),
};

<ChatInput recorder={recorder} onSendMessage={send} recipientName="Stephen" />;
```

Hold the mic to record, release to send, slide left to cancel. Holds under a second are cancelled. The recording arrives as a `voice` message with `duration` and an `audio` `attachment`.

### Other exports

`MessageBubble`, `StickerView`, `MediaEditor`, `MediaViewer`, `EmojiKeyboard`, `EmojiPicker`, `StickerPicker`, `AttachmentMenu`, `useEmojiKeyboard`, `insertAtSelection`, `deleteBackward`, `STICKER_PACKS`, and the types `Message`, `Attachment`, `AttachmentPickers`, `Sticker`, `ChatInputProps`.

## Using it in uchat

[`integration/uchat/MessagesScreen.tsx`](integration/uchat/MessagesScreen.tsx) is uchat's `MessagesScreen` with its input replaced by `ChatInput`. It keeps the existing `handleSendMessage`, @mentions, `ReplyBubble` and `VoiceRecorder`. Before shipping it, check `toUchatAttachments` against what the old `DocumentPicker` sent.

## Troubleshooting

**`Cannot read property 'KeyboardProvider' of undefined`** or **`Failed to create a worklet`**. Metro is serving code built without the Babel plugin, or the app binary predates the native packages. Stop Metro, then run `yarn start --reset-cache`. If it persists, rebuild the app.

**`... doesn't seem to be linked`**. The native app wasn't rebuilt after installing the peer dependencies.

## Development

This repo is also a demo app (`App.tsx` → `src/screens/ChatScreen.tsx`).

```sh
yarn install
yarn start --reset-cache
yarn android            # or: cd ios && pod install && yarn ios
yarn test
```

### Publishing

```sh
npm login               # as a member of the dev-tech org
npm version patch       # or minor / major
npm publish             # builds lib/ via prepack
```
