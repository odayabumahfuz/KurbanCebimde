import 'dotenv/config';

const ENV = process.env.APP_ENV ?? 'development';

const CONFIGS = {
  development: { 
    API_BASE: 'http://185.149.103.247:8000/api/v1',
    API_SERVER_URL: 'http://185.149.103.247:8000'
  },
  preview: { 
    API_BASE: 'http://185.149.103.247:8000/api/v1',
    API_SERVER_URL: 'http://185.149.103.247:8000'
  },
  staging: { 
    API_BASE: 'https://staging.kurbancebimde.com/api/v1',
    API_SERVER_URL: 'https://staging.kurbancebimde.com'
  },
  production: { 
    API_BASE: 'https://api.kurbancebimde.com/api/v1',
    API_SERVER_URL: 'https://api.kurbancebimde.com'
  },
} as const;

const config = CONFIGS[ENV as keyof typeof CONFIGS];

export default {
  expo: {
    name: 'Kurban Cebimde',
    slug: 'kurban-cebimde',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      bundleIdentifier: 'com.kurbancebimde.app',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'Canlı yayın için kamera erişimi gereklidir.',
        NSMicrophoneUsageDescription: 'Canlı yayın için mikrofon erişimi gereklidir.',
        NSBluetoothAlwaysUsageDescription: 'Ses aygıtlarına bağlanmak için Bluetooth erişimi gereklidir.',
        NSBluetoothPeripheralUsageDescription: 'Ses aygıtlarına bağlanmak için Bluetooth erişimi gereklidir.'
      }
    },
    android: {
      package: 'com.kurbancebimde.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'MODIFY_AUDIO_SETTINGS',
        'BLUETOOTH_CONNECT'
      ],
      networkSecurityConfig: './android/app/src/main/res/xml/network_security_config.xml'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    jsEngine: 'hermes',
    newArchEnabled: true,
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            flipper: false,
            deploymentTarget: '15.1',
            useFrameworks: 'static'
          },
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0'
          }
        }
      ],
      'expo-audio'
    ],
    extra: {
      env: ENV,
      apiBase: config.API_BASE,
      apiServerUrl: config.API_SERVER_URL,
      eas: {
        projectId: 'c0b4098a-5731-4190-805e-cb035c4bf4c9'
      }
    },
    owner: 'oday00'
  }
};
