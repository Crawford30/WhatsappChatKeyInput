import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  colorAlpha,
  configSecondary,
  primaryColor,
} from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { BackspaceSVG } from '../assets/svg/BackspaceSVG';
import { EmojiSVG } from '../assets/svg/EmojiSVG';
import { StickerSVG } from '../assets/svg/StickerSVG';
import type { Sticker } from '../types/inputTypes';
import { EmojiPicker } from './EmojiPicker';
import { StickerPicker } from './StickerPicker';

const BACKSPACE_REPEAT_MS = 70;

type Tab = 'emoji' | 'sticker';

export interface EmojiKeyboardProps {
  /** Panel height, normally the last keyboard height */
  height: number;
  bottomInset: number;
  onEmojiSelect: (emoji: string) => void;
  onBackspace: () => void;
  /** Shows the sticker tab when provided */
  onStickerSelect?: (sticker: Sticker) => void;
  /** Change to re-read recent emoji (e.g. each time the panel opens) */
  refreshKey?: number;
}

/** Panel that replaces the system keyboard: emoji grid and stickers */
export const EmojiKeyboard: React.FC<EmojiKeyboardProps> = ({
  height,
  bottomInset,
  onEmojiSelect,
  onBackspace,
  onStickerSelect,
  refreshKey,
}) => {
  const [tab, setTab] = useState<Tab>('emoji');
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = useCallback(() => {
    if (repeatTimer.current) clearInterval(repeatTimer.current);
    repeatTimer.current = null;
  }, []);

  const startRepeat = useCallback(() => {
    stopRepeat();
    repeatTimer.current = setInterval(onBackspace, BACKSPACE_REPEAT_MS);
  }, [onBackspace, stopRepeat]);

  useEffect(() => stopRepeat, [stopRepeat]);

  const renderTab = (
    id: Tab,
    Icon: React.ComponentType<any>,
    label: string
  ) => {
    const active = tab === id;
    return (
      <TouchableOpacity
        accessibilityLabel={label}
        style={[
          themeStyles.flex1,
          themeStyles.flexCenter,
          active && styles.tabActive,
        ]}
        onPress={() => setTab(id)}
        activeOpacity={0.7}>
        <Icon
          width={22}
          height={22}
          color={active ? primaryColor : configSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.panel, { height, paddingBottom: bottomInset }]}>
      <View
        style={[
          themeStyles.flexRow,
          themeStyles.flexNullCenter,
          styles.header,
        ]}>
        <View style={styles.headerSide} />
        <View style={[themeStyles.flex1, themeStyles.flexCenter]}>
          {onStickerSelect && (
            <View
              style={[themeStyles.flexRow, themeStyles.overflow, styles.tabs]}>
              {renderTab('emoji', EmojiSVG, 'Emoji')}
              {renderTab('sticker', StickerSVG, 'Stickers')}
            </View>
          )}
        </View>
        <View style={styles.headerSide}>
          {tab === 'emoji' && (
            <Pressable
              accessibilityLabel="Backspace"
              hitSlop={8}
              style={({ pressed }) => [
                themeStyles.flexCenter,
                styles.backspace,
                pressed && styles.backspacePressed,
              ]}
              onPress={onBackspace}
              onLongPress={startRepeat}
              onPressOut={stopRepeat}>
              <BackspaceSVG width={24} height={24} color={configSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {tab === 'sticker' && onStickerSelect ? (
        <StickerPicker onStickerSelect={onStickerSelect} />
      ) : (
        <EmojiPicker onEmojiSelect={onEmojiSelect} refreshKey={refreshKey} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    height: 48,
    paddingHorizontal: 8,
  },
  headerSide: {
    width: 48,
    alignItems: 'center',
  },
  tabs: {
    width: 150,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colorAlpha(configSecondary).shade30,
  },
  tabActive: {
    backgroundColor: colorAlpha(primaryColor).shade10,
  },
  backspace: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  backspacePressed: {
    backgroundColor: colorAlpha(primaryColor).shade10,
  },
});
