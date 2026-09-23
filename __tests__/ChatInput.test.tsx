import React from 'react';
import { Image, Keyboard, TextInput } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatInput } from '../src/components/ChatInput';
import { EmojiKeyboard } from '../src/components/EmojiKeyboard';
import { AttachmentMenu } from '../src/components/AttachmentMenu';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';
import { MediaEditor } from '../src/components/media/MediaEditor';
import { StickerPicker } from '../src/components/StickerPicker';
import { StickerView } from '../src/components/StickerView';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const byLabel = (root: ReactTestRenderer.ReactTestInstance, label: string) =>
  root.find(
    node =>
      node.props.accessibilityLabel === label && typeof node.type !== 'string'
  );

const render = async (onSendMessage = jest.fn()) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={metrics}>
        <ChatInput onSendMessage={onSendMessage} recipientName="Test" />
      </SafeAreaProvider>
    );
  });
  return renderer.root;
};

test('emoji panel inserts, deletes and toggles back to the keyboard', async () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss');
  const root = await render();
  const input = () => root.findByType(TextInput);
  const panel = () => root.findByType(EmojiKeyboard);

  expect(panel().props.visible).toBe(false);
  expect(panel().props.height).toBe(34); // just the home-indicator inset

  await act(async () => byLabel(root, 'Show emoji').props.onPress());
  expect(dismiss).toHaveBeenCalled();
  expect(panel().props.visible).toBe(true);
  expect(byLabel(root, 'Show keyboard')).toBeTruthy();

  await act(async () => panel().props.onEmojiSelect('😂'));
  await act(async () => panel().props.onEmojiSelect('🇺🇸'));
  expect(input().props.value).toBe('😂🇺🇸');

  await act(async () => byLabel(root, 'Backspace').props.onPress());
  expect(input().props.value).toBe('😂');

  // Emoji goes where the cursor is, not always at the end
  await act(async () => {
    input().props.onChangeText('ab');
    input().props.onSelectionChange({
      nativeEvent: { selection: { start: 1, end: 1 } },
    });
  });
  await act(async () => panel().props.onEmojiSelect('🔥'));
  expect(input().props.value).toBe('a🔥b');
});

test('restored text (e.g. a draft) continues from the end', async () => {
  const root = await render();
  const input = () => root.findByType(TextInput);
  const panel = () => root.findByType(EmojiKeyboard);

  await act(async () => byLabel(root, 'Show emoji').props.onPress());
  await act(async () => input().props.onChangeText('draft'));
  await act(async () => panel().props.onEmojiSelect('👍'));
  expect(input().props.value).toBe('draft👍');
});

test('clip opens the attachment menu and each option launches its picker', async () => {
  const root = await render();
  const menus = () => root.findAllByType(AttachmentMenu);

  expect(menus()).toHaveLength(0);
  await act(async () => byLabel(root, 'Attach').props.onPress());
  expect(menus()).toHaveLength(1);

  await act(async () => byLabel(root, 'Gallery').props.onPress());
  expect(launchImageLibrary).toHaveBeenCalled();
  expect(menus()).toHaveLength(0); // closes before the system picker opens

  await act(async () => byLabel(root, 'Attach').props.onPress());
  await act(async () => byLabel(root, 'Document').props.onPress());
  expect(pick).toHaveBeenCalledWith(expect.objectContaining({ type: ['*/*'] }));

  await act(async () => byLabel(root, 'Attach').props.onPress());
  await act(async () => byLabel(root, 'Audio').props.onPress());
  expect(pick).toHaveBeenCalledWith(
    expect.objectContaining({ type: ['audio/*'] })
  );

  // Tapping the clip again closes the menu
  await act(async () => byLabel(root, 'Attach').props.onPress());
  await act(async () => byLabel(root, 'Attach').props.onPress());
  expect(menus()).toHaveLength(0);
});

test('camera photo opens the editor, which sends it with caption and view once', async () => {
  (launchCamera as jest.Mock).mockResolvedValueOnce({
    assets: [
      {
        uri: 'file://photo.jpg',
        fileName: 'photo.jpg',
        width: 400,
        height: 300,
      },
    ],
  });
  const onSendMessage = jest.fn();
  const root = await render(onSendMessage);

  await act(async () => byLabel(root, 'Camera').props.onPress());
  expect(launchCamera).toHaveBeenCalled();
  expect(onSendMessage).not.toHaveBeenCalled(); // editor first, like WhatsApp

  const editor = root.findByType(MediaEditor);
  // The test renderer has no layout pass; give the canvas area a size
  const stage = editor.findByProps({ testID: 'media-editor-stage' });
  await act(async () =>
    stage.props.onLayout({
      nativeEvent: { layout: { width: 360, height: 600 } },
    })
  );

  const caption = editor.find(
    n =>
      n.props.placeholder === 'Add a caption...' && typeof n.type !== 'string'
  );
  await act(async () => caption.props.onChangeText('Sunset'));
  await act(async () => byLabel(editor, 'View once off').props.onPress());
  await act(async () => byLabel(editor, 'Send').props.onPress());

  // No pixel edits, so the original full-quality file is sent
  expect(onSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'attachment',
      text: 'Sunset',
      viewOnce: true,
      attachment: expect.objectContaining({
        kind: 'image',
        uri: 'file://photo.jpg',
      }),
    })
  );
  expect(root.findAllByType(MediaEditor)).toHaveLength(0);
});

test('an edited photo is flattened with view-shot before sending', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValueOnce({
    assets: [
      { uri: 'file://a.jpg', fileName: 'a.jpg', width: 400, height: 300 },
    ],
  });
  const onSendMessage = jest.fn();
  const root = await render(onSendMessage);

  await act(async () => byLabel(root, 'Attach').props.onPress());
  await act(async () => byLabel(root, 'Gallery').props.onPress());
  const editor = root.findByType(MediaEditor);
  await act(async () =>
    editor
      .findByProps({ testID: 'media-editor-stage' })
      .props.onLayout({ nativeEvent: { layout: { width: 360, height: 600 } } })
  );
  // Simulate the canvas image finishing loading
  await act(async () =>
    editor
      .findByType(Image)
      .props.onLoad({ nativeEvent: { source: { width: 400, height: 300 } } })
  );

  await act(async () => byLabel(editor, 'Text').props.onPress());
  const textInput = editor.find(
    n => n.props.placeholder === 'Type something' && typeof n.type !== 'string'
  );
  await act(async () => textInput.props.onChangeText('Hi!'));
  await act(async () => byLabel(editor, 'Done').props.onPress());
  await act(async () => byLabel(editor, 'Send').props.onPress());

  expect(captureRef).toHaveBeenCalled();
  expect(onSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      attachment: expect.objectContaining({ uri: 'file://captured.jpg' }),
    })
  );
});

test('sticker tab shows stickers and sends a sticker message', async () => {
  const onSendMessage = jest.fn();
  const root = await render(onSendMessage);

  await act(async () => byLabel(root, 'Show emoji').props.onPress());
  await act(async () => byLabel(root, 'Stickers').props.onPress());

  const stickers = root.findAllByType(StickerView);
  expect(stickers.length).toBeGreaterThan(0);
  expect(stickers[0].props.sticker.emoji).toBeTruthy(); // works offline

  await act(async () =>
    root
      .findByType(StickerPicker)
      .props.onStickerSelect(stickers[0].props.sticker)
  );
  expect(onSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'sticker',
      text: '',
      sticker: stickers[0].props.sticker,
    })
  );
});
