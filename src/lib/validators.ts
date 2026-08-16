export function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([^\/?]+)/,
    /\/open\?id=([^&]+)/,
    /\/uc\?id=([^&]+)/,
    /\/file\/view\?id=([^&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isValidGoogleDriveUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const isDrive = parsed.hostname.includes("drive.google.com");
    const hasFileId = extractGoogleDriveFileId(url) !== null;
    return isDrive && hasFileId;
  } catch {
    return false;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}