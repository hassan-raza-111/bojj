// Environment Configuration
export const ENV_CONFIG = {
  // Backend API URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',

  // Frontend URL
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8080',

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'VenBid',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Development Mode
  IS_DEV: import.meta.env.DEV || false,
  IS_PROD: import.meta.env.PROD || false,
};

export default ENV_CONFIG;
