export const getImageUrl = (urlOrId: string, size: string = 's1600') => {
  if (!urlOrId) return '';
  
  // Extract ID from full Google Drive URLs
  const driveMatch = urlOrId.match(/id=([^"&']+)/) || urlOrId.match(/\/d\/([^"&'/]+)/);
  if (driveMatch && driveMatch[1]) {
    // Return direct URL to Google's CDN
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=${size}`;
  }
  
  if (urlOrId.startsWith('http') || urlOrId.startsWith('/')) return urlOrId;
  return `https://lh3.googleusercontent.com/d/${urlOrId}=${size}`;
};

/**
 * Returns the original unscaled full-resolution image URL (=s0) for fullscreen viewing & downloads.
 */
export const getHighResImageUrl = (urlOrId: string) => getImageUrl(urlOrId, 's0');
