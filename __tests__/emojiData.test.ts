import {
  EMOJI_CATEGORIES,
  searchEmojis,
  TONE_ENABLED,
  withSkinTone,
} from '../src/data/emojiData';

describe('catalogue', () => {
  test('has the full set, with hands and people', () => {
    const all = EMOJI_CATEGORIES.flatMap(c => c.emojis);
    expect(all.length).toBeGreaterThan(1500);
    expect(all).toEqual(expect.arrayContaining(['👍', '🙏', '👋', '🇺🇬']));
    expect(EMOJI_CATEGORIES.map(c => c.id)).toEqual([
      'recent',
      'smileys',
      'animals',
      'food',
      'activity',
      'travel',
      'objects',
      'symbols',
      'flags',
    ]);
  });

  test('marks emoji that take skin tones', () => {
    expect(TONE_ENABLED.has('👍')).toBe(true);
    expect(TONE_ENABLED.has('😂')).toBe(false);
  });
});

describe('withSkinTone', () => {
  test.each([
    ['👍', 3, '👍🏽'],
    ['👋', 1, '👋🏻'],
    ['👍', 0, '👍'],
    // Variation selector is replaced by the tone
    ['☝️', 5, '☝🏿'],
    // Tone goes on the person, before the joiner
    ['🙋‍♀️', 2, '🙋🏼‍♀️'],
  ])('%s with tone %d → %s', (emoji, tone, expected) => {
    expect(withSkinTone(emoji, tone)).toBe(expected);
  });
});

describe('searchEmojis', () => {
  test('finds by name and keyword prefixes', () => {
    expect(searchEmojis('thumbs')).toContain('👍');
    expect(searchEmojis('joy')).toContain('😂');
    expect(searchEmojis('laugh')).toContain('🤣');
    expect(searchEmojis('ugand')).toContain('🇺🇬');
  });

  test('every typed word must match', () => {
    const results = searchEmojis('red heart');
    expect(results).toContain('❤️');
    expect(results).not.toContain('💙');
  });

  test('exact and shortest names rank first', () => {
    const results = searchEmojis('cat');
    expect(results.slice(0, 2)).toEqual(['🐈', '🐱']);
    expect(results.indexOf('😹')).toBeGreaterThan(1);
  });

  test('empty query and no match return nothing', () => {
    expect(searchEmojis('  ')).toEqual([]);
    expect(searchEmojis('zzzqqq')).toEqual([]);
  });
});

describe('storage', () => {
  test('restores recents and tones, and saves changes', async () => {
    const saved: Record<string, string> = {
      'uchat-chat-input:recent-emojis': JSON.stringify(['🦁', '🚀']),
      'uchat-chat-input:emoji-tones': JSON.stringify({ '👍': 4 }),
    };
    const storage = {
      getItem: jest.fn(async (key: string) => saved[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        saved[key] = value;
      }),
    };

    await jest.isolateModulesAsync(async () => {
      const data = require('../src/data/emojiData');
      await data.setEmojiStorage(storage);
      expect(data.getRecentEmojis()).toEqual(['🦁', '🚀']);
      expect(data.getPreferredTone('👍')).toBe(4);

      data.addRecentEmoji('🎉');
      data.setPreferredTone('👋', 2);
    });

    expect(JSON.parse(saved['uchat-chat-input:recent-emojis'])).toEqual([
      '🎉',
      '🦁',
      '🚀',
    ]);
    expect(JSON.parse(saved['uchat-chat-input:emoji-tones'])).toEqual({
      '👍': 4,
      '👋': 2,
    });
  });

  test('a broken storage falls back to defaults without throwing', async () => {
    await jest.isolateModulesAsync(async () => {
      const data = require('../src/data/emojiData');
      await data.setEmojiStorage({
        getItem: () => {
          throw new Error('disk full');
        },
        setItem: () => {
          throw new Error('disk full');
        },
      });
      expect(data.getRecentEmojis().length).toBeGreaterThan(0);
      expect(() => data.addRecentEmoji('🎉')).not.toThrow();
    });
  });
});
