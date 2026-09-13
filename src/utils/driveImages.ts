export const getImageUrl = (urlOrId: string) => {
  if (!urlOrId) return '';
  
  // Extract ID from full Google Drive URLs
  const driveMatch = urlOrId.match(/id=([^"&']+)/) || urlOrId.match(/\/d\/([^"&'/]+)/);
  if (driveMatch && driveMatch[1]) {
    // Return direct URL to Google's CDN to save Vercel bandwidth
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=s1600`;
  }
  
  if (urlOrId.startsWith('http') || urlOrId.startsWith('/')) return urlOrId;
  return `https://lh3.googleusercontent.com/d/${urlOrId}=s1600`;
};
