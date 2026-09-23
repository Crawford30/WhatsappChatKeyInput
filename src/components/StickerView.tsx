import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Sticker } from '../types/inputTypes';

interface StickerViewProps {
  sticker: Sticker;
  size: number;
}

/** Renders an image sticker, or an emoji with a white die-cut outline */
export const StickerView: React.FC<StickerViewProps> = ({ sticker, size }) => {
  if (sticker.image) {
    return (
      <Image
        source={{ uri: sticker.image }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  const fontSize = size * 0.72;
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Text
        allowFontScaling={false}
        style={[styles.emoji, { fontSize, lineHeight: fontSize * 1.15 }]}>
        {sticker.emoji}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
    // White halo gives the cut-out sticker look
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
