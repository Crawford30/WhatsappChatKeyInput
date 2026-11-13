module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-keyboard-controller|react-native-reanimated|react-native-worklets|react-native-safe-area-context)/)',
  ],
};
