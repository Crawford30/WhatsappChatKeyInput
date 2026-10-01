import type { EmojiCategory, EmojiStorage } from '../types/inputTypes';
import { EMOJI_CATALOG } from './emojiCatalog';

const DEFAULT_RECENTS = ['😂', '❤️', '😍', '🔥', '👍', '😊', '🎉', '💯'];
const MAX_RECENT_EMOJIS = 27;
const MAX_SEARCH_RESULTS = 60;

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: 'recent', name: 'Recents', icon: '🕐', emojis: DEFAULT_RECENTS },
  ...EMOJI_CATALOG.map(group => ({
    id: group.id,
    name: group.name,
    icon: group.emojis[0][0],
    emojis: group.emojis.map(([emoji]) => emoji),
  })),
];

// ---- skin tones -----------------------------------------------------------

/** Emoji that accept a skin tone modifier (hands, people, ...) */
export const TONE_ENABLED = new Set(
  EMOJI_CATALOG.flatMap(group =>
    group.emojis.filter(entry => entry[2]).map(([emoji]) => emoji)
  )
);

/** Light → dark, as shown in the tone picker (index 0 is the default yellow) */
export const SKIN_TONE_COUNT = 5;

/**
 * The emoji with a skin tone (1 = light … 5 = dark; 0 = default). The tone
 * modifier goes after the first code point, replacing a variation selector
 * if there is one (e.g. ☝️ → ☝🏽, 🙋‍♀️ → 🙋🏽‍♀️).
 */
export const withSkinTone = (emoji: string, tone: number): string => {
  if (!tone) return emoji;
  const [first, ...rest] = Array.from(emoji);
  const tail = rest[0] === '️' ? rest.slice(1) : rest;
  return first + String.fromCodePoint(0x1f3fa + tone) + tail.join('');
};

// ---- search ---------------------------------------------------------------

const SEARCH_INDEX = EMOJI_CATALOG.flatMap(group =>
  group.emojis.map(([emoji, words]) => {
    const [name, keywords] = words.split('|');
    return {
      emoji,
      name,
      nameWords: name.split(' '),
      keywords: keywords ? keywords.split(' ') : [],
    };
  })
);

const prefixesAny = (term: string, list: string[]) =>
  list.some(word => word.startsWith(term));

/**
 * Emoji matching every typed word (as a word prefix of the name or a
 * keyword). Ranked: exact name, name starting with the query (shortest
 * first), all words in the name, then keyword matches.
 */
export const searchEmojis = (
  query: string,
  limit = MAX_SEARCH_RESULTS
): string[] => {
  const text = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const terms = text.split(' ').filter(Boolean);
  if (!terms.length) return [];

  const tiers: { emoji: string; length: number }[][] = [[], [], [], []];
  for (const entry of SEARCH_INDEX) {
    const inName = terms.every(term => prefixesAny(term, entry.nameWords));
    if (
      !inName &&
      !terms.every(
        term =>
          prefixesAny(term, entry.nameWords) ||
          prefixesAny(term, entry.keywords)
      )
    ) {
      continue;
    }
    const tier =
      entry.name === text
        ? 0
        : entry.name.startsWith(text)
        ? 1
        : inName
        ? 2
        : 3;
    tiers[tier].push({ emoji: entry.emoji, length: entry.name.length });
  }
  tiers[1].sort((a, b) => a.length - b.length);
  return tiers
    .flat()
    .slice(0, limit)
    .map(match => match.emoji);
};

// ---- recents and preferred tones (optionally persisted) --------------------

const RECENTS_KEY = 'uchat-chat-input:recent-emojis';
const TONES_KEY = 'uchat-chat-input:emoji-tones';

let recentEmojis: string[] = [...DEFAULT_RECENTS];
let preferredTones: Record<string, number> = {};
let storage: EmojiStorage | undefined;
let loaded: Promise<void> | null = null;

const save = (key: string, value: unknown) => {
  try {
    const result = storage?.setItem(key, JSON.stringify(value));
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // Storage is best effort; the in-memory state still works
  }
};

const read = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/**
 * Use `next` to remember recents and skin tones across app restarts. Saved
 * values load on the first call; later calls only replace where changes are
 * saved.
 */
export const setEmojiStorage = (next?: EmojiStorage): Promise<void> => {
  if (!next) return loaded ?? Promise.resolve();
  // Load once; a new object later (e.g. recreated each render) just takes
  // over saving, without reloading over what's in memory
  const first = !storage;
  storage = next;
  if (!first) return loaded ?? Promise.resolve();
  loaded = (async () => {
    const [recents, tones] = await Promise.all([
      read<string[]>(RECENTS_KEY),
      read<Record<string, number>>(TONES_KEY),
    ]);
    if (Array.isArray(recents) && recents.length) recentEmojis = recents;
    if (tones && typeof tones === 'object') preferredTones = tones;
  })();
  return loaded;
};

export const getRecentEmojis = (): string[] => recentEmojis;

export const addRecentEmoji = (emoji: string): void => {
  recentEmojis = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(
    0,
    MAX_RECENT_EMOJIS
  );
  save(RECENTS_KEY, recentEmojis);
};

/** Last skin tone picked for a tone-enabled emoji (0 = default) */
export const getPreferredTone = (emoji: string): number =>
  preferredTones[emoji] ?? 0;

export const setPreferredTone = (emoji: string, tone: number): void => {
  preferredTones = { ...preferredTones, [emoji]: tone };
  save(TONES_KEY, preferredTones);
};
