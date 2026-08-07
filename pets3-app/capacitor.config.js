const config = {
  appId: 'com.pets3.vocab',
  appName: '我想背单词',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#f5f6f8',
      showSpinner: false,
    },
  },
};

module.exports = config;
