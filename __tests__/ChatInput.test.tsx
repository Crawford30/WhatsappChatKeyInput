import React from 'react';
import { Keyboard, TextInput } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatInput } from '../src/components/ChatInput';
import { EmojiKeyboard } from '../src/components/EmojiKeyboard';
import { AttachmentMenu } from '../src/components/AttachmentMenu';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick } from '@react-native-documents/picker';

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
        <ChatInput onSendMessage={onSendMessage} />
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

test('camera icon opens the camera and sends the photo', async () => {
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
  const input = () => root.findByType(TextInput);

  await act(async () => input().props.onChangeText('look'));
  // Camera icon hides while typing (as in WhatsApp); clear to show it
  expect(
    root.findAll(n => n.props.accessibilityLabel === 'Camera')
  ).toHaveLength(0);
  await act(async () => input().props.onChangeText(''));
  await act(async () => byLabel(root, 'Camera').props.onPress());

  expect(launchCamera).toHaveBeenCalled();
  expect(onSendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'attachment',
      attachment: expect.objectContaining({
        kind: 'image',
        uri: 'file://photo.jpg',
      }),
    })
  );
});
