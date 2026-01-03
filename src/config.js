// API Configuration
// In development, uses localhost
// In production, uses environment variable or relative path
const getApiBaseUrl = () => {
  // Check if we're in development
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }
  
  // In production, use environment variable or default to relative path
  // If backend is deployed separately, use the full URL
  return process.env.REACT_APP_API_URL || '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export default for easy imports
export default {
  API_BASE_URL
};

