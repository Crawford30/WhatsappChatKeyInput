import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PanelType, Sticker } from '../types/inputTypes';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';
import { GifPicker } from './GifPicker';

interface Props {
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: Sticker) => void;
  onBackspace: () => void;
  hasText: boolean;
  onClose: () => void;
}

export const UnifiedPanel: React.FC<Props> = ({
  onEmojiSelect,
  onStickerSelect,
  onBackspace,
  hasText,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PanelType>(PanelType.EMOJI);

  const renderTab = useCallback(
    (type: PanelType, label: string) => {
      const isActive = activeTab === type;
      return (
        <TouchableOpacity
          key={type}
          style={styles.tab}
          onPress={() => setActiveTab(type)}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {label}
          </Text>
          {isActive && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      );
    },
    [activeTab]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {activeTab === PanelType.EMOJI && (
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          {renderTab(PanelType.EMOJI, 'EMOJI')}
          {renderTab(PanelType.GIF, 'GIF')}
          {renderTab(PanelType.STICKER, 'STICKER')}
        </View>

        <View style={styles.headerRight}>
          {activeTab === PanelType.EMOJI && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={hasText ? onBackspace : onClose}
              activeOpacity={0.6}>
              <Text style={styles.iconText}>{hasText ? '⌫' : '✕'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === PanelType.EMOJI && (
          <EmojiPicker onEmojiSelect={onEmojiSelect} />
        )}
        {activeTab === PanelType.GIF && (
          <GifPicker onGifSelect={onStickerSelect} />
        )}
        {activeTab === PanelType.STICKER && (
          <StickerPicker onStickerSelect={onStickerSelect} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 350, backgroundColor: '#1F2C34' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3942',
  },
  headerLeft: { width: 48, alignItems: 'center' },
  headerRight: { width: 48, alignItems: 'center' },
  tabs: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 24 },
  tab: { paddingVertical: 8, paddingHorizontal: 4, position: 'relative' },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8696A0',
    letterSpacing: 0.5,
  },
  tabLabelActive: { color: '#00A884' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00A884',
    borderRadius: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20, color: '#8696A0' },
  content: { flex: 1, backgroundColor: '#0B141A' },
});
