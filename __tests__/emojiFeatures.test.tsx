import React from 'react';
import { Text, TextInput } from 'react-native';
import { KeyboardEvents } from 'react-native-keyboard-controller';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatInput } from '../src/components/ChatInput';
import { EmojiKeyboard } from '../src/components/EmojiKeyboard';
import { EmojiPicker } from '../src/components/EmojiPicker';
import { EmojiSearch } from '../src/components/EmojiSearch';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Picker measures itself to place the tone bubble
const createNodeMock = () => ({
  measureInWindow: (cb: (x: number, y: number) => void) => cb(0, 0),
});

const byLabel = (root: ReactTestRenderer.ReactTestInstance, label: string) =>
  root.find(
    node =>
      node.props.accessibilityLabel === label && typeof node.type !== 'string'
  );

// Fire the latest keyboard-controller listener for an event
const fireKeyboard = (name: string, height = 300) => {
  const calls = (KeyboardEvents.addListener as jest.Mock).mock.calls;
  const handler = [...calls].reverse().find(([event]) => event === name)?.[1];
  handler?.({ height, duration: 250, timestamp: 0, target: 1 });
};

const render = async (props = {}) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={metrics}>
        <ChatInput onSendMessage={jest.fn()} recipientName="Test" {...props} />
      </SafeAreaProvider>,
      { createNodeMock }
    );
  });
  const root = renderer.root;
  const messageInput = () =>
    root.find(
      n => n.props.placeholder === 'Message' && typeof n.type !== 'string'
    );
  return { root, messageInput };
};

describe('emoji search', () => {
  test('search, insert, keyboard hides → back to the emoji panel', async () => {
    const { root, messageInput } = await render();
    await act(async () => byLabel(root, 'Show emoji').props.onPress());
    await act(async () => byLabel(root, 'Search emoji').props.onPress());
    expect(root.findAllByType(EmojiSearch)).toHaveLength(1);

    const field = root
      .findByType(EmojiSearch)
      .find(
        n => n.props.placeholder === 'Search emoji' && n.type === TextInput
      );
    await act(async () => field.props.onChangeText('thumbs'));
    await act(async () =>
      byLabel(root.findByType(EmojiSearch), '👍').props.onPress()
    );
    expect(messageInput().props.value).toBe('👍');

    // The search keyboard shows: search stays open
    await act(async () => fireKeyboard('keyboardWillShow'));
    await act(async () => fireKeyboard('keyboardDidShow'));
    expect(root.findAllByType(EmojiSearch)).toHaveLength(1);

    // Keyboard closed: the emoji panel takes its place
    await act(async () => fireKeyboard('keyboardWillHide'));
    expect(root.findAllByType(EmojiSearch)).toHaveLength(0);
    expect(byLabel(root, 'Show keyboard')).toBeTruthy();
  });

  test('tapping the message field leaves search', async () => {
    const { root, messageInput } = await render();
    await act(async () => byLabel(root, 'Show emoji').props.onPress());
    await act(async () => byLabel(root, 'Search emoji').props.onPress());
    await act(async () => fireKeyboard('keyboardWillShow'));
    await act(async () => messageInput().props.onFocus({}));
    expect(root.findAllByType(EmojiSearch)).toHaveLength(0);
  });

  test('no search button when emojis are off', async () => {
    const { root } = await render({ emojis: false });
    await act(async () => byLabel(root, 'Show emoji').props.onPress());
    expect(
      root.findAll(n => n.props.accessibilityLabel === 'Search emoji')
    ).toHaveLength(0);
  });
});

describe('skin tones', () => {
  test('long press picks a tone, which the grid then remembers', async () => {
    const onEmojiSelect = jest.fn();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <EmojiPicker onEmojiSelect={onEmojiSelect} />,
        { createNodeMock }
      );
    });
    const root = renderer.root;
    const cell = () =>
      root.find(
        n =>
          typeof n.type !== 'string' &&
          n.props.accessibilityHint === 'Long press for skin tones'
      );
    const base = cell().props.accessibilityLabel;

    await act(async () =>
      cell().props.onLongPress({
        nativeEvent: { pageX: 50, pageY: 300, locationX: 10, locationY: 10 },
      })
    );
    await act(async () => byLabel(root, 'Skin tone 3').props.onPress());

    const toned = onEmojiSelect.mock.calls[0][0];
    expect(toned).not.toBe(base);
    expect(toned.codePointAt(2)).toBe(0x1f3fd); // medium tone
    // The bubble closed and the cell now shows the chosen tone
    expect(
      root.findAll(n => n.props.accessibilityLabel === 'Skin tone 3')
    ).toHaveLength(0);
    expect(root.findAllByType(Text).some(t => t.props.children === toned)).toBe(
      true
    );
  });
});

describe('emojiStorage', () => {
  test('restores recents from storage into the panel', async () => {
    const storage = {
      getItem: jest.fn(async (key: string) =>
        key.endsWith('recent-emojis') ? JSON.stringify(['🦒']) : null
      ),
      setItem: jest.fn(),
    };
    const { root } = await render({ emojiStorage: storage });
    await act(async () => byLabel(root, 'Show emoji').props.onPress());
    expect(storage.getItem).toHaveBeenCalled();
    const recents = root
      .findByType(EmojiKeyboard)
      .findAll(n => n.props.accessibilityLabel === '🦒');
    expect(recents.length).toBeGreaterThan(0);

    await act(async () =>
      root.findByType(EmojiKeyboard).props.onEmojiSelect('🎉')
    );
    expect(storage.setItem).toHaveBeenCalledWith(
      'uchat-chat-input:recent-emojis',
      expect.stringContaining('🎉')
    );
  });
});
