import React from 'react';
import { Keyboard, TextInput } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatInput } from '../src/components/ChatInput';
import { EmojiKeyboard } from '../src/components/EmojiKeyboard';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const byLabel = (root: ReactTestRenderer.ReactTestInstance, label: string) =>
  root.find(
    node =>
      node.props.accessibilityLabel === label && typeof node.type !== 'string'
  );

const render = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={metrics}>
        <ChatInput onSendMessage={jest.fn()} />
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
