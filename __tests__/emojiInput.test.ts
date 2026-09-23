import { deleteBackward, insertAtSelection } from '../src/Helpers/emojiInput';

const at = (cursor: number) => ({ start: cursor, end: cursor });

describe('insertAtSelection', () => {
  test('inserts at the cursor and moves it past the emoji', () => {
    expect(insertAtSelection('hi there', at(2), '😂')).toEqual({
      text: 'hi😂 there',
      cursor: 4,
    });
  });

  test('replaces a selected range', () => {
    expect(insertAtSelection('hello', { start: 1, end: 4 }, '❤️')).toEqual({
      text: 'h❤️o',
      cursor: 3,
    });
  });

  test('clamps a stale cursor past the end of the text', () => {
    expect(insertAtSelection('', at(10), '🔥')).toEqual({
      text: '🔥',
      cursor: 2,
    });
  });
});

describe('deleteBackward', () => {
  const deleteLast = (text: string) =>
    deleteBackward(text, at(text.length)).text;

  test.each([
    ['plain character', 'abc', 'ab'],
    ['surrogate pair', 'a😂', 'a'],
    ['variation selector', 'a❤️', 'a'],
    ['flag (picker)', 'a🇺🇸', 'a'],
    ['flag (not in picker)', 'a🇳🇬', 'a'],
    ['ZWJ sequence (picker)', 'a🏳️‍🌈', 'a'],
    ['ZWJ sequence (not in picker)', 'a👨‍👩‍👧', 'a'],
    ['skin tone', 'a👍🏽', 'a'],
    ['keycap', 'a#️⃣', 'a'],
    ['subdivision flag', 'a🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'a'],
  ])('removes a whole %s', (_, input, expected) => {
    expect(deleteLast(input)).toBe(expected);
  });

  test('deletes before the cursor, not at the end', () => {
    expect(deleteBackward('a😂b', at(3))).toEqual({ text: 'ab', cursor: 1 });
  });

  test('deletes the selection when one exists', () => {
    expect(deleteBackward('hello', { start: 1, end: 3 })).toEqual({
      text: 'hlo',
      cursor: 1,
    });
  });

  test('does nothing at the start of the text', () => {
    expect(deleteBackward('abc', at(0))).toEqual({ text: 'abc', cursor: 0 });
  });
});
