import { createHash } from "crypto";
import {
  existsSync, readFileSync, readdirSync, writeFileSync,
} from "fs";
import { join } from "path";

// Run before bundling so each model URL reflects the bytes being deployed.
export const generateModelAssetHashes = (projectRoot: string): boolean => {
  const modelDir = join(projectRoot, "public/3D/models");
  const hashes: Record<string, string> = {};
  readdirSync(modelDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith(".glb"))
    .map(entry => entry.name)
    .sort()
    .forEach(name => {
      hashes[`/3D/models/${name}`] = createHash("sha256")
        .update(readFileSync(join(modelDir, name)))
        .digest("hex");
    });
  const output = join(projectRoot,
    "frontend/three_d_garden/model_asset_hashes.json");
  const content = JSON.stringify(hashes, undefined, 2) + "\n";
  if (existsSync(output) && readFileSync(output, "utf8") == content) {
    return false;
  }
  // Avoid triggering the development bundler unless model content changed.
  writeFileSync(output, content);
  return true;
};
