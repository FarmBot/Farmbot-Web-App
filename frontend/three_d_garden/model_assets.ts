import modelAssetHashes from "./model_asset_hashes.json";

export const modelAssetUrls = (models: Record<string, string>) => {
  const hashes: Record<string, string> = modelAssetHashes;
  const urls: Record<string, string> = {};
  Object.entries(models).forEach(([name, url]) => {
    const hash = hashes[url];
    if (!hash) {
      throw new Error(`Missing model asset hash: ${url}. Rebuild assets.`);
    }
    urls[name] = `${url}?v=${hash}`;
  });
  return urls;
};
