// app.config.js
export default ({ config }) => {
  // Ensure config.expo exists
  const expoConfig = config.expo || {};
  // Detect production build via EAS_BUILD_PROFILE or custom env var
  const isProd = process.env.EAS_BUILD_PROFILE === 'production' || process.env.EXPO_NO_DEV_MENU === 'true';

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

  // Include dev-menu only in non-production
  const plugins = isProd ? basePlugins : [...basePlugins, 'expo-dev-menu'];

  return {
    ...config,
    expo: {
      ...expoConfig,
      name: 'OhBet',
      slug: 'ohbetappfinal',
      version: '1.0.56',
      orientation: 'portrait',
      icon: './assets/ohbet-icon-final.png',
      userInterfaceStyle: 'light',
      platforms: ['ios', 'android', 'web'],
      updates: { fallbackToCacheTimeout: 0 },
      assetBundlePatterns: ['**/*'],
      plugins,
      ios: {
        ...(expoConfig.ios || {}),
        bundleIdentifier: 'com.spl.ohbetappfinal',
        buildNumber: '126',
        supportsTablet: true,
        icon: './assets/ohbet-icon-final.png',
        infoPlist: {
          CFBundleDisplayName: 'OhBet',
          NSUserNotificationUsageDescription: 'We use notifications to keep you updated.',
          UIBackgroundModes: ['remote-notification'],
        },
        // Explicit entitlements to force production on TestFlight
        entitlements: {
          'aps-environment': isProd ? 'production' : 'development',
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
        eas: { projectId: '72c1f9c2-2829-45e3-bac6-20bc0c2e992a' },
      },
    },
  };
};
