# WhatsappChatKeyInput

A WhatsApp-style chat input for React Native: switch between the keyboard,
an emoji panel and a sticker panel without the input bar jumping, plus
hold-to-record voice messages.

React Native 0.87 (new architecture), Android Gradle Plugin 9.

## Run it

```sh
yarn install
yarn start            # Metro

yarn android          # Android
cd ios && bundle exec pod install && cd ..
yarn ios              # iOS
```

`yarn test`, `yarn lint` and `npx tsc --noEmit` should all pass.

## How the input works

```
ChatScreen
├─ FlatList (inverted)        newest message at the bottom; dragging it closes the input
└─ ChatInput
   ├─ input bar               😊 / text / 🗒️   +   send or mic
   └─ bottom spacer           height = max(keyboard, panel, bottom safe area)
      └─ EmojiPicker | StickerPicker   (height = the keyboard's last height)
```

- **One spacer, no `KeyboardAvoidingView`.**
  [`react-native-keyboard-controller`](https://kirillzyusko.github.io/react-native-keyboard-controller/)
  reports the keyboard height every frame on both platforms. The spacer under
  the input bar is the larger of that height, the panel height and the bottom
  safe area.
- **Panels are keyboard-sized.** The panel always uses the keyboard's last
  measured height (300 pt until the keyboard has been opened once). So:
  - keyboard → emoji: the panel takes the keyboard's height immediately, then
    the keyboard is dismissed; the spacer never changes, the bar does not move;
  - emoji → keyboard: the input is focused and the panel stays until the
    keyboard is fully up, then collapses underneath it.
- **Android back** closes an open panel before leaving the screen.
- **Emoji are inserted at the cursor.** The panel's ⌫ deletes one emoji even
  when it is several code points (👨‍👩‍👧, 👍🏽, 🇺🇬, 1️⃣) – see
  `deleteBeforeCursor` in `src/Helpers/helper.ts`.
- **Voice:** press and hold the mic. Slide left to cancel, release to send; a
  quick tap shows a hint. The mic button owns the whole gesture (it stays
  under the finger). Audio levels are simulated – add a native recorder
  (e.g. `react-native-nitro-sound`) for real recordings.
- **Stickers** are large emoji, so they work offline.

## Files

| File | What it does |
|---|---|
| `src/components/ChatInput.tsx` | input bar, keyboard/panel switching, hold-to-record |
| `src/components/EmojiPicker.tsx` | category tabs, recents, ⌫ |
| `src/components/StickerPicker.tsx` | sticker packs |
| `src/components/VoiceRecorder.tsx` | recording bar (timer, waveform, slide hint) |
| `src/screens/ChatScreen.tsx` | header, message bubbles |
| `src/hooks/useInputHook.ts` | recording timer, recent items |
| `src/data/*` | emoji categories, sticker packs |

## Notes

- `android/gradle.properties` has `edgeToEdgeEnabled=true` (RN 0.87 default);
  keyboard-controller handles insets on Android.
- The mic keeps its centre outside Android's edge back-gesture strip;
  otherwise sliding left to cancel can be taken as the system back gesture.
- `.yarnrc.yml` sets `nodeLinker: node-modules` (React Native does not
  support Yarn Plug'n'Play).
