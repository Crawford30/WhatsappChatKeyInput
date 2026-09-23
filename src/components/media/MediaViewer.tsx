import React from 'react';
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles as themeStyles } from '../../assets/style/Styles';
import { CloseSVG } from '../../assets/svg/CloseSVG';
import { ViewOnceSVG } from '../../assets/svg/ViewOnceSVG';

interface MediaViewerProps {
  uri: string | null;
  caption?: string;
  viewOnce?: boolean;
  onClose: () => void;
}

/** Full-screen photo viewer opened from a chat bubble */
export const MediaViewer: React.FC<MediaViewerProps> = ({
  uri,
  caption,
  viewOnce,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={!!uri}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait']}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View
        style={[
          themeStyles.flex1,
          styles.container,
          { paddingTop: insets.top },
        ]}>
        <View
          style={[
            themeStyles.flexRow,
            themeStyles.flexNullCenter,
            styles.header,
          ]}>
          <TouchableOpacity
            accessibilityLabel="Close"
            style={styles.close}
            onPress={onClose}>
            <CloseSVG width={22} height={22} color="white" />
          </TouchableOpacity>
          {viewOnce && (
            <View
              style={[
                themeStyles.flexRow,
                themeStyles.flexNullCenter,
                themeStyles.gap5,
              ]}>
              <ViewOnceSVG width={18} height={18} color="white" />
              <Text style={styles.headerText}>View once photo</Text>
            </View>
          )}
        </View>
        {uri && (
          <Image
            source={{ uri }}
            style={themeStyles.flex1}
            resizeMode="contain"
          />
        )}
        {!!caption && (
          <Text style={[styles.caption, { paddingBottom: insets.bottom + 16 }]}>
            {caption}
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  header: {
    height: 56,
    paddingHorizontal: 8,
    gap: 8,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 15,
  },
  caption: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
