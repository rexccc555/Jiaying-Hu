/** Build a stable Unsplash CDN URL (Unsplash License — suitable for commercial use). */
export function unsplashPhoto(photoIdSuffix: string, w = 640): string {
  // Keep params minimal — some legacy `photo-*` ids 404 with `fit=crop` or are removed entirely.
  return `https://images.unsplash.com/photo-${photoIdSuffix}?w=${w}&q=80`;
}
