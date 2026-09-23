/* global jest */
// Native pickers have no JS implementation under Jest
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({ didCancel: true })),
  launchImageLibrary: jest.fn(async () => ({ didCancel: true })),
}));

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(async () => []),
  types: { allFiles: '*/*', audio: 'audio/*' },
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: () => false,
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(async () => 'file://captured.jpg'),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest')
);
