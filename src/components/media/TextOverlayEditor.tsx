import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles as themeStyles } from '../../assets/style/Styles';
import { EDITOR_COLORS } from './editorTypes';

interface TextOverlayEditorProps {
  initialValue: string;
  initialColor: string;
  topInset: number;
  onDone: (value: string, color: string) => void;
}

export const ColorSwatches = ({
  value,
  onChange,
  vertical,
}: {
  value: string;
  onChange: (color: string) => void;
  vertical?: boolean;
}) => (
  <View
    style={[
      vertical ? styles.swatchesVertical : themeStyles.flexRow,
      styles.swatches,
    ]}>
    {EDITOR_COLORS.map(color => (
      <TouchableOpacity
        key={color}
        accessibilityLabel={`Colour ${color}`}
        onPress={() => onChange(color)}
        style={[
          styles.swatch,
          { backgroundColor: color },
          color === value && styles.swatchActive,
        ]}
      />
    ))}
  </View>
);

/** Full-screen text entry used by the "Aa" tool, WhatsApp style */
export const TextOverlayEditor: React.FC<TextOverlayEditorProps> = ({
  initialValue,
  initialColor,
  topInset,
  onDone,
}) => {
  const [value, setValue] = useState(initialValue);
  const [color, setColor] = useState(initialColor);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.backdrop,
        { paddingTop: topInset },
      ]}>
      <View
        style={[
          themeStyles.flexRow,
          themeStyles.flexNullCenter,
          styles.header,
        ]}>
        <View style={themeStyles.flex1}>
          <ColorSwatches value={color} onChange={setColor} />
        </View>
        <TouchableOpacity
          accessibilityLabel="Done"
          style={styles.done}
          onPress={() => onDone(value, color)}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={[themeStyles.flex1, themeStyles.flexCenter]}>
        <TextInput
          autoFocus
          multiline
          value={value}
          onChangeText={setValue}
          placeholder="Type something"
          placeholderTextColor="rgba(255,255,255,0.5)"
          selectionColor={color}
          style={[styles.input, { color }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  swatches: {
    gap: 10,
    alignItems: 'center',
  },
  swatchesVertical: {
    flexDirection: 'column',
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  swatchActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'white',
  },
  done: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  doneText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    width: '100%',
    paddingHorizontal: 24,
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
