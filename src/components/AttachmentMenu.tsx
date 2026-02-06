import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../Helpers/constants';

const { height } = Dimensions.get('window');

export interface AttachmentOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onDocumentPress: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onAudioPress: () => void;
  onLocationPress: () => void;
  onContactPress: () => void;
  onPollPress: () => void;
  onEventPress: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  visible,
  onClose,
  onDocumentPress,
  onCameraPress,
  onGalleryPress,
  onAudioPress,
  onLocationPress,
  onContactPress,
  onPollPress,
  onEventPress,
}) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const attachmentOptions: AttachmentOption[] = [
    {
      id: 'document',
      label: 'Document',
      icon: '📄',
      color: '#7C5FF8',
      onPress: onDocumentPress,
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: '📷',
      color: '#FF396F',
      onPress: onCameraPress,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: '🖼️',
      color: '#5B8DEF',
      onPress: onGalleryPress,
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: '🎧',
      color: '#FF9F43',
      onPress: onAudioPress,
    },
    {
      id: 'catalog',
      label: 'Catalog',
      icon: '🏪',
      color: '#5F7A8A',
      onPress: () => {},
    },
    {
      id: 'quick-reply',
      label: 'Quick Reply',
      icon: '⚡',
      color: '#FFA500',
      onPress: () => {},
    },
    {
      id: 'location',
      label: 'Location',
      icon: '📍',
      color: '#00D856',
      onPress: onLocationPress,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: '👤',
      color: '#5B8DEF',
      onPress: onContactPress,
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: '📊',
      color: '#FFA500',
      onPress: onPollPress,
    },
    {
      id: 'event',
      label: 'Event',
      icon: '📅',
      color: '#FF396F',
      onPress: onEventPress,
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              <View style={styles.header}>
                <View style={styles.handle} />
              </View>

              <View style={styles.grid}>
                {attachmentOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionContainer}
                    onPress={() => {
                      option.onPress();
                      onClose();
                    }}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: option.color },
                      ]}>
                      <Text style={styles.iconText}>{option.icon}</Text>
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: height * 0.7,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#3A3A3C',
    borderRadius: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  optionContainer: {
    width: '25%',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: FontSizes.xs,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
