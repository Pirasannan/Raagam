import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL;
if (serverUrl && new URL(serverUrl).protocol !== 'https:') {
  throw new Error('CAPACITOR_SERVER_URL must be an HTTPS deployment URL.');
}

const config: CapacitorConfig = {
  appId: 'com.raagam.app',
  appName: 'Raagam',
  webDir: 'mobile-web',
  ...(serverUrl ? { server: { url: serverUrl, cleartext: false } } : {}),
  android: {
    allowMixedContent: false,
    backgroundColor: '#f0eae2',
  },
  ios: {
    backgroundColor: '#f0eae2',
    contentInset: 'automatic',
  },
};

export default config;
