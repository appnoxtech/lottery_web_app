// Web-compatible Firebase configuration
// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Web-compatible Firebase functions (placeholder implementations)
export const requestUserPermission = async (): Promise<boolean> => {
  console.log('Web environment: Notification permission not implemented');
  return true;
};

export const getFcmToken = async (): Promise<string | null> => {
  console.log('Web environment: FCM token not implemented');
  // Store a placeholder token for web
  const webToken = 'web-token-' + Date.now();
  localStorage.setItem('fcm_token', webToken);
  return webToken;
};

export const onForegroundNotification = () => {
  console.log('Web environment: Foreground notification not implemented');
  return () => {}; // Return a cleanup function
};

export const onNotificationOpenedApp = () => {
  console.log('Web environment: Notification opened app not implemented');
};

export const checkInitialNotification = async () => {
  console.log('Web environment: Initial notification check not implemented');
};

export const deleteFcmToken = async () => {
  console.log('Web environment: Delete FCM token');
  localStorage.removeItem('fcm_token');
};

export { firebaseConfig };
