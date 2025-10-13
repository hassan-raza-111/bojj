// Utility functions for handling image URLs
import { ENV_CONFIG } from '@/config/env';

/**
 * Converts a relative image URL to a full URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full URL for the image
 */
export const getImageUrl = (
  imageUrl: string | undefined | null
): string | null => {
  if (!imageUrl) return null;

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads/, convert to full URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${ENV_CONFIG.BACKEND_URL}${imageUrl}`;
  }

  // Return as is for other cases
  return imageUrl;
};

/**
 * Gets the backend URL for API calls
 * @returns Backend URL
 */
export const getBackendUrl = (): string => {
  return ENV_CONFIG.BACKEND_URL;
};
