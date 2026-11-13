/** 0:07, 1:23 */
export const formatDuration = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/** 14:05 */
export const formatTime = (date: Date): string =>
  date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const ZWJ = '‍';
// attach to the code point before them: variation selectors, keycap, skin tones
const isModifier = (c: string) =>
  /^(?:[︎️⃣]|[\u{1F3FB}-\u{1F3FF}])$/u.test(c);
const isRegionalIndicator = (c: string) => /^[\u{1F1E6}-\u{1F1FF}]$/u.test(c);

/**
 * Removes the character before `cursor`, treating a multi-code-point emoji
 * (👨‍👩‍👧 ZWJ sequences, skin tones, 🇺🇬 flags, keycaps 1️⃣, ❤️) as one
 * character, the way the system keyboard's backspace does.
 */
export const deleteBeforeCursor = (
  text: string,
  cursor: number,
): {text: string; cursor: number} => {
  const chars = Array.from(text.slice(0, cursor));
  if (chars.length === 0) {
    return {text, cursor: 0};
  }
  // index of the first code point of the last character
  let start = chars.length - 1;
  const toBase = () => {
    while (start > 0 && (isModifier(chars[start]) || chars[start] === ZWJ)) {
      start--;
    }
  };
  toBase();
  // part of a ZWJ sequence: keep walking back over "<base><mods> ZWJ"
  while (start > 1 && chars[start - 1] === ZWJ) {
    start -= 2;
    toBase();
  }
  // flags are pairs of regional indicators; count the run to find the pair
  if (isRegionalIndicator(chars[start])) {
    let run = 0;
    for (let i = start; i >= 0 && isRegionalIndicator(chars[i]); i--) {
      run++;
    }
    if (run % 2 === 0) {
      start--;
    }
  }
  const before = chars.slice(0, start).join('');
  return {text: before + text.slice(cursor), cursor: before.length};
};
