import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../Helpers/constants';

const { width, height } = Dimensions.get('window');

interface CreateStickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onUseAI: () => void;
}

export const CreateStickerModal: React.FC<CreateStickerModalProps> = ({
  visible,
  onClose,
  onCamera,
  onUseAI,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showRecents, setShowRecents] = useState(true);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create sticker</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {!selectedImage ? (
            <>
              {/* Create Options */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onCamera}
                  activeOpacity={0.7}>
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionIconText}>📷</Text>
                  </View>
                  <Text style={styles.optionText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onUseAI}
                  activeOpacity={0.7}>
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionIconText}>✨</Text>
                  </View>
                  <Text style={styles.optionText}>Use AI</Text>
                </TouchableOpacity>
              </View>

              {/* Recents Section */}
              <View style={styles.recentsSection}>
                <TouchableOpacity
                  style={styles.recentsHeader}
                  onPress={() => setShowRecents(!showRecents)}
                  activeOpacity={0.7}>
                  <Text style={styles.recentsTitle}>Recents</Text>
                  <Text style={styles.recentsArrow}>
                    {showRecents ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {showRecents && (
                  <ScrollView style={styles.recentsGrid}>
                    <View style={styles.recentsWrapper}>
                      {/* Sample recent images - replace with actual data */}
                      {[1, 2, 3, 4, 5, 6].map(item => (
                        <TouchableOpacity
                          key={item}
                          style={styles.recentItem}
                          onPress={() => setSelectedImage(`image-${item}`)}
                          activeOpacity={0.7}>
                          <View style={styles.recentImagePlaceholder}>
                            <Text style={styles.placeholderText}>📷</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </>
          ) : (
            <StickerEditor
              imageUri={selectedImage}
              onBack={() => setSelectedImage(null)}
              onSave={() => {
                // Handle save
                onClose();
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Sticker Editor Component
interface StickerEditorProps {
  imageUri: string;
  onBack: () => void;
  onSave: () => void;
}

const StickerEditor: React.FC<StickerEditorProps> = ({
  imageUri,
  onBack,
  onSave,
}) => {
  const [stickerName, setStickerName] = useState('Joel Crawford');

  return (
    <View style={styles.editorContainer}>
      {/* Canvas */}
      <View style={styles.canvas}>
        <View style={styles.canvasInner}>
          {/* Sample sticker preview */}
          <View style={styles.stickerPreview}>
            <View style={styles.stickerIconsRow}>
              <View
                style={[styles.stickerIcon, { backgroundColor: '#7C5FF8' }]}>
                <Text style={styles.stickerIconText}>📄</Text>
              </View>
              <View
                style={[styles.stickerIcon, { backgroundColor: '#5B8DEF' }]}>
                <Text style={styles.stickerIconText}>🖼️</Text>
              </View>
              <View
                style={[styles.stickerIcon, { backgroundColor: '#8B4513' }]}>
                <Text style={styles.stickerIconText}>🎧</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Tools */}
        <View style={styles.editTools}>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolIcon}>😊</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolIcon}>Aa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.stickerName}>{stickerName}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionButtonInner}>
              <Text style={styles.actionIcon}>📦</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={onSave}
            activeOpacity={0.7}>
            <View style={styles.sendButtonInner}>
              <Text style={styles.sendIcon}>▶</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  optionButton: {
    alignItems: 'center',
    width: 120,
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  optionIconText: {
    fontSize: 40,
  },
  optionText: {
    fontSize: FontSizes.md,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recentsSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  recentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  recentsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentsArrow: {
    fontSize: FontSizes.sm,
    color: '#8E8E93',
  },
  recentsGrid: {
    flex: 1,
  },
  recentsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  recentItem: {
    width: (width - Spacing.lg * 2 - Spacing.md * 2) / 3,
    aspectRatio: 1,
  },
  recentImagePlaceholder: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  // Editor Styles
  editorContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasInner: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerIconsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  stickerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerIconText: {
    fontSize: 24,
  },
  editTools: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xxxl,
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 20,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  stickerName: {
    fontSize: FontSizes.md,
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 0,
  },
  actionButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
  },
  sendButton: {
    flex: 1,
  },
  sendButtonInner: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});
