import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

const { height } = Dimensions.get('window');

interface AttachmentOption {
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
  const slideAnim = useRef(new Animated.Value(height * 0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height * 0.7,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const attachmentOptions: AttachmentOption[] = [
    {
      id: 'document',
      label: 'Document',
      icon: '📄',
      color: '#7F66FF',
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
      color: '#5B9CF9',
      onPress: onGalleryPress,
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: '🎵',
      color: '#FF9500',
      onPress: onAudioPress,
    },
    {
      id: 'location',
      label: 'Location',
      icon: '📍',
      color: '#00C853',
      onPress: onLocationPress,
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: '👤',
      color: '#00A9F2',
      onPress: onContactPress,
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: '📊',
      color: '#FFA726',
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
      animationType="none"
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              {/* Handle Bar */}
              <View style={styles.header}>
                <View style={styles.handle} />
              </View>

              {/* Attachment Options Grid */}
              <View style={styles.grid}>
                {attachmentOptions.map(option => (
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
        </Animated.View>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: height * 0.7,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  optionContainer: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconText: {
    fontSize: 28,
  },
  optionLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
