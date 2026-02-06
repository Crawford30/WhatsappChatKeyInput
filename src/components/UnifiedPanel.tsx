import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PanelType, Sticker } from '../types/inputTypes';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';
import { GifPicker } from './GifPicker';

const { width } = Dimensions.get('window');

interface UnifiedPanelProps {
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: Sticker) => void;
}

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({
  onEmojiSelect,
  onStickerSelect,
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
      {/* Top Tab Bar - WhatsApp Style */}
      <View style={styles.topTabBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        <View style={styles.tabsContainer}>
          {renderPanelTab(PanelType.EMOJI, 'EMOJI')}
          {renderPanelTab(PanelType.GIF, 'GIF')}
          {renderPanelTab(PanelType.STICKER, 'STICKER')}
        </View>

        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
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
    backgroundColor: '#1F2C34', // Dark theme like WhatsApp
  },
  topTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2C34',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  searchContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
    color: '#8696A0',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
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
    color: '#00A884', // WhatsApp green
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#8696A0',
  },
  panelContent: {
    flex: 1,
    backgroundColor: '#0B141A', // Darker background
  },
});
