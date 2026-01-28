import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a69c56c483f4cd989cba01d7493307c',
  appName: 'MovieReviewHub',
  webDir: 'dist',
  // Uncomment server block for hot-reload during development:
  // server: {
  //   url: 'https://4a69c56c-483f-4cd9-89cb-a01d7493307c.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'MovieReviewHub',
    scrollEnabled: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
