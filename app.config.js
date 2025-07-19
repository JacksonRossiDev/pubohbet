export default ({ config }) => {
  // Dynamically remove expo-dev-menu in production
  const plugins = [
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

  if (process.env.EXPO_NO_DEV_MENU === 'true') {
    // Remove expo-dev-menu in production builds
    config.plugins = plugins.filter((plugin) => plugin !== 'expo-dev-menu');
  } else {
    // Include expo-dev-menu in dev builds
    config.plugins = [...plugins, 'expo-dev-menu'];
  }

  return {
    ...config,
    expo: {
      ...config.expo,
      name: 'OhBet',
      slug: 'ohbetappfinal',
      version: '1.0.5',
      orientation: 'portrait',
      icon: './assets/ohbet-icon-final.png',
      userInterfaceStyle: 'light',
      platforms: ['ios', 'android', 'web'],
      updates: {
        fallbackToCacheTimeout: 0,
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        buildNumber: '102',
        supportsTablet: true,
        bundleIdentifier: 'com.spl.ohbetappfinal',
        icon: './assets/ohbet-icon-final.png',
        infoPlist: {
          CFBundleDisplayName: 'OhBet',
          UIBackgroundModes: ['remote-notification'],
        },
        config: {
          usesNonExemptEncryption: false,
        },
      },
      android: {
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
        favicon: './assets/favicon.png',
      },
      extra: {
        eas: {
          projectId: '72c1f9c2-2829-45e3-bac6-20bc0c2e992a',
        },
      },
    },
  };
};