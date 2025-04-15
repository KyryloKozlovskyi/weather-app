/**
 * Production environment configuration
 * This file contains settings specific to the production build.
 * It will be used when running the application in production mode.
 */
export const environment = {
  production: true, // Flag to indicate this is the production environment
  openWeatherMapApiKey: 'c213bf7641522d502751e12a087b3d5d', // API key for OpenWeatherMap service
  // Note: In a real production app, this API key should be handled securely
  // Consider using environment variables or a secure backend service
};
