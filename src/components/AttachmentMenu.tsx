import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { configSecondary } from '../assets/style/Colors';
import { styles as themeStyles } from '../assets/style/Styles';
import { CameraSVG } from '../assets/svg/CameraSVG';
import { DocumentSVG } from '../assets/svg/DocumentSVG';
import { GallerySVG } from '../assets/svg/GallerySVG';
import { HeadphonesSVG } from '../assets/svg/HeadphonesSVG';
import { ATTACHMENT_COLORS } from '../utils/colors';

export interface AttachmentMenuProps {
  height: number;
  bottomInset: number;
  onDocument: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onAudio: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  height,
  bottomInset,
  onDocument,
  onCamera,
  onGallery,
  onAudio,
}) => {
  const options = [
    {
      label: 'Document',
      Icon: DocumentSVG,
      color: ATTACHMENT_COLORS.document,
      onPress: onDocument,
    },
    {
      label: 'Camera',
      Icon: CameraSVG,
      color: ATTACHMENT_COLORS.camera,
      onPress: onCamera,
    },
    {
      label: 'Gallery',
      Icon: GallerySVG,
      color: ATTACHMENT_COLORS.gallery,
      onPress: onGallery,
    },
    {
      label: 'Audio',
      Icon: HeadphonesSVG,
      color: ATTACHMENT_COLORS.audio,
      onPress: onAudio,
    },
  ];

  return (
    <View
      style={[
        themeStyles.flexRow,
        styles.panel,
        { height, paddingBottom: bottomInset },
      ]}>
      {options.map(({ label, Icon, color, onPress }) => (
        <TouchableOpacity
          key={label}
          accessibilityLabel={label}
          style={[themeStyles.flex1, themeStyles.flexCenter, themeStyles.gap5]}
          onPress={onPress}
          activeOpacity={0.7}>
          <View
            style={[
              themeStyles.flexCenter,
              styles.circle,
              { backgroundColor: color },
            ]}>
            <Icon width={24} height={24} color="white" />
          </View>
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  label: {
    fontSize: 13,
    color: configSecondary,
  },
});
