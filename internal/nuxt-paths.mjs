const ensureTrailingSlash = (value) => {
  if (!value) return '/';
  return value.endsWith('/') ? value : `${value}/`;
};

export function baseURL() {
  return ensureTrailingSlash(process.env.NUXT_APP_BASE_URL || '/');
}

export function buildAssetsDir() {
  return process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/';
}

export function publicAssetsURL(...path) {
  const cdn = process.env.NUXT_APP_CDN_URL || '';
  const base = cdn || baseURL();
  if (path.length === 0) return base;

  return [base.replace(/\/$/, ''), ...path.map((segment) => String(segment).replace(/^\/+/, ''))].join('/');
}

export function buildAssetsURL(...path) {
  const dir = buildAssetsDir().replace(/^\/+/, '').replace(/\/$/, '');
  return publicAssetsURL(dir, ...path);
}
