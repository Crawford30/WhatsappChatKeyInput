import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  RECENT_EMOJIS: '@recent_emojis',
};

export const StorageService = {
  /**
   * Save recently used emojis
   */
  async saveRecentEmojis(emojis: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RECENT_EMOJIS, JSON.stringify(emojis));
    } catch (error) {
      console.error('Failed to save recent emojis:', error);
    }
  },

  /**
   * Get recently used emojis
   */
  async getRecentEmojis(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECENT_EMOJIS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get recent emojis:', error);
      return [];
    }
  },

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};
