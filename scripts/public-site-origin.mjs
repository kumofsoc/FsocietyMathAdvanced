// Never derive public canonical URLs or the consent-loader hostname from
// VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL: these can identify a deployment
// instead of the domain visitors use. Only explicit VITE_PUBLIC_SITE_URL may
// override the stable production domain.
export const DEFAULT_PUBLIC_ORIGIN = "https://mathmamath.vercel.app";

export function resolvePublicSiteOrigin(env = process.env) {
  const raw = (env.VITE_PUBLIC_SITE_URL || DEFAULT_PUBLIC_ORIGIN).trim();
  const url = new URL(raw.includes("://") ? raw : "https://" + raw);
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("VITE_PUBLIC_SITE_URL must be an HTTPS origin, without a path, query, or fragment.");
  }
  return url.origin;
}
