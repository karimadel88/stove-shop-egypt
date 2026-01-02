import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures media URLs point to the correct backend origin.
 * Handles:
 * - Full URLs pointing to localhost:3000 (replaces with current API origin)
 * - Relative paths (prefixes with API origin)
 * - Already correct absolute URLs
 */
export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  
  // If it's already an absolute URL but not localhost:3000, return as is
  if (url.startsWith('http') && !url.includes('localhost:3000')) {
    return url;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const apiOrigin = apiBaseUrl.replace('/api', '');

  // If it's a localhost:3000 URL from backend, extract the path and prepend correct origin
  if (url.includes('localhost:3000')) {
    const path = url.split('localhost:3000')[1];
    return `${apiOrigin}${path}`;
  }

  // If it's a relative path, prepend API origin
  if (!url.startsWith('http')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${apiOrigin}${cleanPath}`;
  }

  return url;
}
