const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      fs: require.resolve('./src/stubs/fs-stub.js'),

      os: require.resolve('./src/stubs/fs-stub.js'),

      path: require.resolve('./src/stubs/fs-stub.js'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
