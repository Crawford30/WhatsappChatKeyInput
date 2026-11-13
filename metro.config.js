const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    // RN 0.87 removed Libraries/Image/AssetRegistry.js; images register through
    // the public export. Explicit so an older/stale @react-native/metro-config
    // default cannot point Metro at the deleted file.
    assetRegistryPath: 'react-native/asset-registry',
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
