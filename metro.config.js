const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    // If you need SVG support, keep this
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Keep default extensions but add TS/TSX if missing
    sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx', 'svg'],

    // Remove svg from assets (if using react-native-svg-transformer)
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),

    // Node module resolution paths
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],

    // TS path alias mapping
    extraNodeModules: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  watchFolders: [
    path.resolve(__dirname, 'src'), // watch your source folder
  ],
};

module.exports = mergeConfig(defaultConfig, config);