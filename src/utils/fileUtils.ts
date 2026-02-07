import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const log = (...values: any[]) => console.log(...values);

export const requestAudioPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // Check if permission is already granted
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );

      if (checkResult) {
        log('Android: RECORD_AUDIO permission already granted');
        return true;
      }

      const permission = PERMISSIONS.ANDROID.RECORD_AUDIO;

      log('Android: Checking RECORD_AUDIO permission...');
      const status = await check(permission);
      log('Android: Current permission status:', status);

      if (status === RESULTS.GRANTED) {
        log('Android: RECORD_AUDIO permission already granted');
        return true;
      }

      if (status === RESULTS.DENIED) {
        log('Android: Requesting RECORD_AUDIO permission...');
        const result = await request(permission);
        log('Android: Permission request result:', result);

        if (result === RESULTS.GRANTED) {
          return true;
        }
      }

      if (status === RESULTS.BLOCKED) {
        log('Android: RECORD_AUDIO permission is blocked');
        Alert.alert(
          'Microphone Permission Required',
          'Microphone permission is permanently denied. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }

      log('Android: Permission request denied');
      return false;
    } else if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.MICROPHONE;

      log('iOS: Checking microphone permission...');
      const status = await check(permission);
      log('iOS: Current permission status:', status);

      if (status === RESULTS.GRANTED) {
        log('iOS: Microphone permission already granted');
        return true;
      }

      if (status === RESULTS.DENIED) {
        log('iOS: Requesting microphone permission...');
        const result = await request(permission);
        log('iOS: Permission request result:', result);

        if (result === RESULTS.GRANTED) {
          return true;
        }
      }

      if (status === RESULTS.BLOCKED) {
        log('iOS: Microphone permission is blocked');
        Alert.alert(
          'Microphone Permission Required',
          'Microphone permission is permanently denied. Please enable it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }

      log('iOS: Permission request denied');
      return false;
    }

    log('Unsupported platform');
    return false;
  } catch (error) {
    log('Error requesting audio permission:', error);
    return false;
  }
};
