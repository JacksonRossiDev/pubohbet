// app.config.js
export default {
  expo: {
    name: 'OhBet',
    slug: 'ohbetappfinal',
    version: '5.0.0',
    orientation: 'portrait',
    icon: './assets/ohbet-icon-final.png',
    userInterfaceStyle: 'light',
    platforms: ['ios', 'android', 'web'],
    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ['**/*'],
    plugins: [
      'expo-dev-client',
      [
        'expo-notifications',
        { icon: './assets/ohbet-icon-final.png', color: '#000000' }
      ],
      [
        'expo-camera',
        { cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.' }
      ],
      'expo-tracking-transparency',
      'expo-dev-menu'
    ],
    ios: {
      bundleIdentifier: 'com.spl.ohbetappfinal',
      buildNumber: '129',
      supportsTablet: true,
      icon: './assets/ohbet-icon-final.png',
      infoPlist: {
        CFBundleDisplayName: 'OhBet',
        NSUserNotificationUsageDescription: 'We use notifications to keep you updated.',
        UIBackgroundModes: ['remote-notification']
      },
      // Force production entitlement
      entitlements: {
        'aps-environment': 'production'
      }
    },
    android: {
      package: 'com.spl.ohbetappfinal',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.POST_NOTIFICATIONS'
      ],
      adaptiveIcon: {
        foregroundImage: './assets/ohbet-icon-final.png',
        backgroundColor: '#FFFFFF'
      }
    },
    notification: {
      icon: './assets/ohbet-icon-final.png',
      color: '#000000',
      androidMode: 'default',
      androidCollapsedTitle: 'New Notification'
    },
    web: { favicon: './assets/favicon.png' },
    extra: { eas: { projectId: '72c1f9c2-2829-45e3-bac6-20bc0c2e992a' } }
  }
};
