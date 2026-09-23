import { useCallback } from 'react';
import { Alert } from 'react-native';
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
import type { Attachment, AttachmentKind } from '../types/inputTypes';

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

const handleImageResponse = (response: ImagePickerResponse) => {
  if (response.didCancel) return [];
  if (response.errorCode) {
    showError(
      response.errorCode === 'camera_unavailable'
        ? 'No camera is available on this device.'
        : response.errorMessage
    );
    return [];
  }
  return (response.assets || [])
    .map(fromImageAsset)
    .filter((item): item is Attachment => item !== null);
};

/**
 * Camera, gallery, document and audio pickers returning one Attachment shape.
 * Every picker resolves to [] when the user cancels.
 */
export const useAttachmentPicker = (
  onPick: (attachments: Attachment[]) => void
) => {
  const deliver = useCallback(
    (attachments: Attachment[]) => {
      if (attachments.length) onPick(attachments);
    },
    [onPick]
  );

  const openCamera = useCallback(async () => {
    const response = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    deliver(handleImageResponse(response));
  }, [deliver]);

  const openGallery = useCallback(async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 10,
    });
    deliver(handleImageResponse(response));
  }, [deliver]);

  const pickFiles = useCallback(
    async (kind: AttachmentKind) => {
      try {
        const files = await pick({
          type: kind === 'audio' ? [types.audio] : [types.allFiles],
          allowMultiSelection: true,
        });
        deliver(
          files.map(file => ({
            kind,
            uri: file.uri,
            name: file.name || (kind === 'audio' ? 'Audio' : 'Document'),
            size: file.size,
            mimeType: file.type,
          }))
        );
      } catch (error) {
        if (
          isErrorWithCode(error) &&
          error.code === errorCodes.OPERATION_CANCELED
        ) {
          return;
        }
        showError(error instanceof Error ? error.message : undefined);
      }
    },
    [deliver]
  );

  const pickDocument = useCallback(() => pickFiles('document'), [pickFiles]);
  const pickAudio = useCallback(() => pickFiles('audio'), [pickFiles]);

  return { openCamera, openGallery, pickDocument, pickAudio };
};
