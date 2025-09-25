module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-template-literals',
      // Diğer pluginler buraya gelebilir
      // Reanimated plugin EN SONDA olmalı
      'react-native-reanimated/plugin',
    ],
  };
};
