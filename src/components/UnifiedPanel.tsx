import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PanelType, Sticker } from '../types/inputTypes';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';
import { GifPicker } from './GifPicker';

interface UnifiedPanelProps {
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: Sticker) => void;
  onBackspace: () => void;
  hasText: boolean;
  onClose: () => void;
}

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({
  onEmojiSelect,
  onStickerSelect,
  onBackspace,
  hasText,
  onClose,
}) => {
  const [activePanelType, setActivePanelType] = useState<PanelType>(
    PanelType.EMOJI
  );

  const renderPanelTab = useCallback(
    (type: PanelType, label: string) => {
      const isActive = activePanelType === type;

      return (
        <TouchableOpacity
          key={type}
          style={styles.panelTab}
          onPress={() => setActivePanelType(type)}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {label}
          </Text>
          {isActive && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      );
    },
    [activePanelType]
  );

  return (
    <View style={styles.container}>
      {/* Top Tab Bar */}
      <View style={styles.topTabBar}>
        {/* Search Icon - Only visible in EMOJI mode */}
        <View style={styles.leftSection}>
          {activePanelType === PanelType.EMOJI && (
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Tabs */}
        <View style={styles.tabsContainer}>
          {renderPanelTab(PanelType.EMOJI, 'EMOJI')}
          {renderPanelTab(PanelType.GIF, 'GIF')}
          {renderPanelTab(PanelType.STICKER, 'STICKER')}
        </View>

        {/* Backspace/Close Button - Only visible in EMOJI mode */}
        <View style={styles.rightSection}>
          {activePanelType === PanelType.EMOJI && (
            <TouchableOpacity
              style={styles.backspaceButton}
              onPress={hasText ? onBackspace : onClose}
              activeOpacity={0.6}>
              {hasText ? (
                // Backspace icon when there's text
                <Text style={styles.backspaceIcon}>⌫</Text>
              ) : (
                // Close X when no text
                <Text style={styles.closeIcon}>✕</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Panel Content */}
      <View style={styles.panelContent}>
        {activePanelType === PanelType.EMOJI && (
          <EmojiPicker onEmojiSelect={onEmojiSelect} />
        )}
        {activePanelType === PanelType.GIF && (
          <GifPicker onGifSelect={onStickerSelect} />
        )}
        {activePanelType === PanelType.STICKER && (
          <StickerPicker onStickerSelect={onStickerSelect} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350,
    backgroundColor: '#1F2C34',
  },
  topTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  leftSection: {
    width: 48,
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.7,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  panelTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8696A0',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#00A884',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00A884',
    borderRadius: 2,
  },
  rightSection: {
    width: 48,
    alignItems: 'center',
  },
  backspaceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backspaceIcon: {
    fontSize: 22,
    color: '#8696A0',
  },
  closeIcon: {
    fontSize: 18,
    color: '#8696A0',
    fontWeight: '300',
  },
  panelContent: {
    flex: 1,
    backgroundColor: '#0B141A',
  },
});
