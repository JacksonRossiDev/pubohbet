// app.config.js
export default ({ config }) => {
  // Ensure config.expo exists
  const expoConfig = config.expo || {};
  
  // Determine if we're in a production build (no dev-menu)
  const isProd = process.env.EXPO_NO_DEV_MENU === 'true';

  // Base plugin list (always include expo-notifications)
  const basePlugins = [
    'expo-dev-client',
    [
      'expo-notifications',
      {
        icon: './assets/ohbet-icon-final.png',
        color: '#000000',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.',
      },
    ],
    'expo-tracking-transparency',
  ];

  // For production builds, strip out the dev-menu plugin
  const plugins = isProd
    ? basePlugins
    : [...basePlugins, 'expo-dev-menu'];

  return {
    ...config,
    expo: {
      ...expoConfig,
      name: 'OhBet',
      slug: 'ohbetappfinal',
      version: '4.0.0',
      orientation: 'portrait',
      icon: './assets/ohbet-icon-final.png',
      userInterfaceStyle: 'light',
      platforms: ['ios', 'android', 'web'],
      updates: {
        fallbackToCacheTimeout: 0,
      },
      assetBundlePatterns: ['**/*'],
      plugins,
      ios: {
        ...(expoConfig.ios || {}),
        bundleIdentifier: 'com.spl.ohbetappfinal',
        buildNumber: '125',
        supportsTablet: true,
        icon: './assets/ohbet-icon-final.png',
        infoPlist: {
          CFBundleDisplayName: 'OhBet',
          NSUserNotificationUsageDescription: 'We use notifications to keep you updated.',
          UIBackgroundModes: ['remote-notification'],
        },
      },
      android: {
        ...(expoConfig.android || {}),
        package: 'com.spl.ohbetappfinal',
        permissions: [
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.POST_NOTIFICATIONS',
        ],
        adaptiveIcon: {
          foregroundImage: './assets/ohbet-icon-final.png',
          backgroundColor: '#FFFFFF',
        },
      },
      notification: {
        icon: './assets/ohbet-icon-final.png',
        color: '#000000',
        androidMode: 'default',
        androidCollapsedTitle: 'New Notification',
      },
      web: {
        ...(expoConfig.web || {}),
        favicon: './assets/favicon.png',
      },
      extra: {
        ...(expoConfig.extra || {}),
        eas: {
          projectId: '72c1f9c2-2829-45e3-bac6-20bc0c2e992a',
        },
      },
    },
  };
};
