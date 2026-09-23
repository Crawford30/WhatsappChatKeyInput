/**
 * Built-in attachment pickers. Kept out of the main entry point so apps that
 * already use other picker libraries don't have to install these:
 *   react-native-image-picker, @react-native-documents/picker
 */
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import {
  Asset,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import type {
  Attachment,
  AttachmentKind,
  AttachmentPickers,
} from './types/inputTypes';

const showError = (message?: string) =>
  Alert.alert('Could not attach file', message || 'Please try again.');

const fromImageAsset = (asset: Asset): Attachment | null =>
  asset.uri
    ? {
        kind: 'image',
        uri: asset.uri,
        name: asset.fileName || 'Photo',
        size: asset.fileSize,
        mimeType: asset.type,
        width: asset.width,
        height: asset.height,
      }
    : null;

const showCameraPermissionError = () =>
  Alert.alert(
    'Camera access needed',
    'Allow camera access in Settings to take photos.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );

/**
 * react-native-image-picker needs no camera permission, unless the app's
 * manifest declares android.permission.CAMERA (e.g. for another feature).
 * Then Android requires it to be granted at runtime first. Requesting a
 * permission the manifest doesn't declare is a no-op, so always ask.
 */
const ensureCameraPermission = async () => {
  if (Platform.OS !== 'android') return;
  const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
  if (!(await PermissionsAndroid.check(permission))) {
    await PermissionsAndroid.request(permission);
  }
};

const handleImageResponse = (response: ImagePickerResponse) => {
  if (response.didCancel) return [];
  if (response.errorCode) {
    if (response.errorCode === 'permission') showCameraPermissionError();
    else {
      showError(
        response.errorCode === 'camera_unavailable'
          ? 'No camera is available on this device.'
          : response.errorMessage
      );
    }
    return [];
  }
  return (response.assets || [])
    .map(fromImageAsset)
    .filter((item): item is Attachment => item !== null);
};

const pickFiles = async (kind: AttachmentKind): Promise<Attachment[]> => {
  try {
    const files = await pick({
      type: kind === 'audio' ? [types.audio] : [types.allFiles],
      allowMultiSelection: true,
    });
    return files.map(file => ({
      kind,
      uri: file.uri,
      name: file.name || (kind === 'audio' ? 'Audio' : 'Document'),
      size: file.size,
      mimeType: file.type,
    }));
  } catch (error) {
    if (
      !(isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED)
    ) {
      showError(error instanceof Error ? error.message : undefined);
    }
    return [];
  }
};

export const defaultPickers: AttachmentPickers = {
  openCamera: async () => {
    await ensureCameraPermission();
    return handleImageResponse(
      await launchCamera({ mediaType: 'photo', quality: 0.8 })
    );
  },
  openGallery: async () =>
    handleImageResponse(
      await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10,
      })
    ),
  pickDocument: () => pickFiles('document'),
  pickAudio: () => pickFiles('audio'),
};
