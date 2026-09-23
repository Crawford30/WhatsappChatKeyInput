import { EMOJI_CATEGORIES } from '../data/emojiData';

export interface Selection {
  start: number;
  end: number;
}

export interface TextEdit {
  text: string;
  cursor: number;
}

// Every emoji the picker can insert, so backspace removes it as one unit
// (flags, ZWJ sequences and skin tones span several UTF-16 code units)
const KNOWN_EMOJIS = new Set(EMOJI_CATEGORIES.flatMap(cat => cat.emojis));
const MAX_EMOJI_LENGTH = Math.max(...[...KNOWN_EMOJIS].map(e => e.length));

const ZERO_WIDTH_JOINER = 0x200d;

const isLowSurrogate = (code: number) => code >= 0xdc00 && code <= 0xdfff;

// Code points that modify the character before them: variation selector,
// keycap, skin tones and tag characters (subdivision flags)
const isModifier = (cp: number) =>
  cp === 0xfe0f ||
  cp === 0x20e3 ||
  (cp >= 0x1f3fb && cp <= 0x1f3ff) ||
  (cp >= 0xe0020 && cp <= 0xe007f);

const isRegionalIndicator = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;

const clampSelection = ({ start, end }: Selection, length: number) => ({
  start: Math.min(Math.max(start, 0), length),
  end: Math.min(Math.max(end, 0), length),
});

/**
 * Replace the selected range with `insert` and place the cursor after it
 */
export const insertAtSelection = (
  text: string,
  selection: Selection,
  insert: string
): TextEdit => {
  const { start, end } = clampSelection(selection, text.length);
  return {
    text: text.slice(0, start) + insert + text.slice(end),
    cursor: start + insert.length,
  };
};

/**
 * Length (in UTF-16 units) of the last visible character of `text`
 */
const lastCharacterLength = (text: string): number => {
  for (let n = Math.min(MAX_EMOJI_LENGTH, text.length); n > 1; n--) {
    if (KNOWN_EMOJIS.has(text.slice(-n))) return n;
  }

  // Not from the picker (e.g. typed on the system keyboard): walk back one
  // code point at a time, keeping modifiers and joined characters together
  let i = text.length;
  const stepBack = () => {
    i -= i > 1 && isLowSurrogate(text.charCodeAt(i - 1)) ? 2 : 1;
    return text.codePointAt(i) ?? 0;
  };
  const stepOverModifiers = (cp: number) => {
    while (i > 0 && isModifier(cp)) cp = stepBack();
    return cp;
  };

  const cp = stepOverModifiers(stepBack());
  if (
    isRegionalIndicator(cp) &&
    isRegionalIndicator(text.codePointAt(i - 2) ?? 0)
  ) {
    stepBack();
  }
  while (i > 1 && text.charCodeAt(i - 1) === ZERO_WIDTH_JOINER) {
    i -= 1;
    stepOverModifiers(stepBack());
  }
  return text.length - i;
};

/**
 * Behave like a keyboard backspace: delete the selection, or the single
 * character (including whole emoji) before the cursor
 */
export const deleteBackward = (
  text: string,
  selection: Selection
): TextEdit => {
  const { start, end } = clampSelection(selection, text.length);
  if (start !== end) {
    return { text: text.slice(0, start) + text.slice(end), cursor: start };
  }
  if (start === 0) return { text, cursor: 0 };

  const cursor = start - lastCharacterLength(text.slice(0, start));
  return { text: text.slice(0, cursor) + text.slice(start), cursor };
};
