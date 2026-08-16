export const getImageUrl = (urlOrId: string) => {
  if (!urlOrId) return '';
  
  // Extract ID from full Google Drive URLs
  const driveMatch = urlOrId.match(/id=([^"&']+)/) || urlOrId.match(/\/d\/([^"&'/]+)/);
  if (driveMatch && driveMatch[1]) {
    return `/api/image/${driveMatch[1]}`;
  }
  
  if (urlOrId.startsWith('http') || urlOrId.startsWith('/')) return urlOrId;
  return `/api/image/${urlOrId}`;
};
