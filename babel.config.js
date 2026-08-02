// Needed since react-native-reanimated was added: its worklets plugin ships with
// babel-preset-expo and must run last.
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
  };
};
