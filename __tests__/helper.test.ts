import {deleteBeforeCursor, formatDuration} from '../src/Helpers/helper';

const del = (text: string) => deleteBeforeCursor(text, text.length).text;

test('backspace removes one character, treating emoji as one', () => {
  expect(del('abc')).toBe('ab');
  expect(del('hi 😀')).toBe('hi ');
  expect(del('a❤️')).toBe('a'); // heart + variation selector
  expect(del('a👍🏽')).toBe('a'); // skin tone
  expect(del('a👨‍👩‍👧')).toBe('a'); // ZWJ family
  expect(del('a🏳️‍🌈')).toBe('a'); // flag + VS + ZWJ
  expect(del('a1️⃣')).toBe('a'); // keycap
  expect(del('🇺🇬🇰🇪')).toBe('🇺🇬'); // two flags
  expect(del('')).toBe('');
});

test('backspace in the middle keeps the text after the cursor', () => {
  expect(deleteBeforeCursor('ab😀cd', 4)).toEqual({text: 'abcd', cursor: 2});
});

test('formatDuration', () => {
  expect(formatDuration(0)).toBe('0:00');
  expect(formatDuration(7400)).toBe('0:07');
  expect(formatDuration(83000)).toBe('1:23');
});
