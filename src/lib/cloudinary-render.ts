// Delivery-time Cloudinary URL helpers for the public renderers.
//
// Distinct from src/lib/image-quality.ts: that module rewrites a URL
// ONCE at upload time and the result is what lands in the DB. These
// helpers never touch stored data — they derive an alternate delivery
// URL at render time from whatever the DB already holds.
//
// Stored event URLs look like:
//   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto:good/v<n>/<folder>/<id>.webp
// Cloudinary chains transformation components with `/`, so inserting a
// new component directly after `/upload/` composes with the stored one
// rather than replacing it.

const UPLOAD_PREFIX =
  /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/upload\/)(.+)$/;

export function withCloudinaryTransform(url: string, transform: string): string {
  if (!transform) return url;
  const match = url.match(UPLOAD_PREFIX);
  // Local /assets/… paths and any non-Cloudinary host pass through
  // untouched — callers get a usable URL either way.
  if (!match) return url;
  const [, prefix, tail] = match;
  return `${prefix}${transform}/${tail}`;
}

// Backdrop derivative for letterboxed artwork. At 64px wide the source
// is indistinguishable from the full asset once CSS blur is applied,
// and it costs ~1KB instead of ~100KB.
export function blurBackdropUrl(url: string): string {
  return withCloudinaryTransform(url, 'w_64,c_scale,q_auto:eco');
}
