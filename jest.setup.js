/* eslint-env jest */
// Native modules are not available under Jest.
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn, ...args) => fn(...args),
}));

// The reanimated 4.7 mock still loads its native initializer under Jest, so
// mock only the APIs this app uses.
jest.mock('react-native-reanimated', () => {
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: {View},
    useSharedValue: value => ({value}),
    useAnimatedStyle: updater => updater(),
    withTiming: toValue => toValue,
  };
});
