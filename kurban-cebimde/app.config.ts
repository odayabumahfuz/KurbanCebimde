import 'dotenv/config';
import { ExpoConfig } from "@expo/config";

const ENV = process.env.APP_ENV ?? 'development';

const CONFIGS = {
  development: { 
    API_BASE: 'http://185.149.103.247:8000/api/v1',  // Backend IP
    API_SERVER_URL: 'http://185.149.103.247:8000'
  },
  preview: { 
    API_BASE: 'http://185.149.103.247:8000/api/v1',  // Backend IP
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

const expoConfig: ExpoConfig = {
  name: "Kurban Cebimde",
  slug: "kurban-cebimde",
  scheme: "kurbancebimde",
  version: "1.0.0",
  runtimeVersion: {
    policy: "appVersion" // OTA için sabit bir kural; native değişmedikçe update atabilirsin
  },
  updates: {
    url: "https://u.expo.dev/c0b4098a-5731-4190-805e-cb035c4bf4c9" // EAS Update kullanacaksan proje-id ile doldur
  },
  plugins: [
    "expo-dev-client",
    "expo-updates",
    "expo-video",
    [
      "expo-build-properties",
      {
        ios: {
          flipper: false,
          deploymentTarget: "15.1",
          useFrameworks: "static"
        },
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0"
        }
      }
    ],
    "expo-audio"
  ],
  android: {
    package: "com.kurbancebimde.app",
    permissions: ["CAMERA", "RECORD_AUDIO", "INTERNET", "MODIFY_AUDIO_SETTINGS", "BLUETOOTH_CONNECT"],
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    // Geliştirme backend'in HTTP ise (HTTPS yoksa) alternatifsiz:
    // networkSecurityConfig: "./android/app/src/main/res/xml/network_security_config.xml"
  },
  ios: {
    bundleIdentifier: "com.kurbancebimde.app",
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: "Canlı yayın için kameraya erişim gerekir.",
      NSMicrophoneUsageDescription: "Canlı yayın için mikrofona erişim gerekir.",
      NSBluetoothAlwaysUsageDescription: "Ses aygıtlarına bağlanmak için Bluetooth erişimi gereklidir.",
      NSBluetoothPeripheralUsageDescription: "Ses aygıtlarına bağlanmak için Bluetooth erişimi gereklidir.",
      ITSAppUsesNonExemptEncryption: false
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  jsEngine: "hermes",
  newArchEnabled: true,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  extra: {
    env: ENV,
    apiBase: config.API_BASE,
    apiServerUrl: config.API_SERVER_URL,
    eas: {
      projectId: "c0b4098a-5731-4190-805e-cb035c4bf4c9"
    }
  },
  owner: "oday00"
};

export default { expo: expoConfig };
