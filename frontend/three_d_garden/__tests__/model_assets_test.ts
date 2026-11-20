import { createHash } from "crypto";
import {
  mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "fs";
import { join, resolve } from "path";
import { ASSETS } from "../constants";
import { modelAssetUrls } from "../model_assets";
import { generateModelAssetHashes } from
  "../../../scripts/bun/model_asset_hashes";

const hash = (content: string | Buffer) =>
  createHash("sha256").update(content).digest("hex");

describe("model asset URLs", () => {
  it("versions every configured model with its file content hash", () => {
    Object.values(ASSETS.models).forEach(url => {
      const [path, query] = url.split("?");
      const content = readFileSync(resolve(`public${path}`));
      expect(query).toEqual(`v=${hash(content)}`);
    });
  });

  it("rejects models missing from the generated hashes", () => {
    expect(() => modelAssetUrls({ missing: "/3D/models/missing.glb" }))
      .toThrow("Missing model asset hash");
  });
});

describe("model asset hash generation", () => {
  let projectRoot: string;
  let modelDir: string;
  let output: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(resolve(".model-asset-hashes-test-"));
    modelDir = join(projectRoot, "public/3D/models");
    const frontendDir = join(projectRoot, "frontend/three_d_garden");
    mkdirSync(modelDir, { recursive: true });
    mkdirSync(frontendDir, { recursive: true });
    output = join(frontendDir, "model_asset_hashes.json");
    writeFileSync(join(modelDir, "utm.glb"), "original");
    writeFileSync(join(modelDir, "other.glb"), "unchanged");
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it("hashes only GLB files and writes deterministic output", () => {
    writeFileSync(join(modelDir, "notes.txt"), "ignored");
    mkdirSync(join(modelDir, "directory.glb"));
    expect(generateModelAssetHashes(projectRoot)).toEqual(true);
    expect(readFileSync(output, "utf8")).toEqual(JSON.stringify({
      "/3D/models/other.glb": hash("unchanged"),
      "/3D/models/utm.glb": hash("original"),
    }, undefined, 2) + "\n");
    expect(generateModelAssetHashes(projectRoot)).toEqual(false);
  });

  it("updates only the changed model hash", () => {
    generateModelAssetHashes(projectRoot);
    writeFileSync(join(modelDir, "utm.glb"), "updated");
    expect(generateModelAssetHashes(projectRoot)).toEqual(true);
    expect(JSON.parse(readFileSync(output, "utf8"))).toEqual({
      "/3D/models/other.glb": hash("unchanged"),
      "/3D/models/utm.glb": hash("updated"),
    });
  });

  it("includes newly added models and removes deleted models", () => {
    generateModelAssetHashes(projectRoot);
    writeFileSync(join(modelDir, "new.glb"), "new model");
    rmSync(join(modelDir, "other.glb"));
    expect(generateModelAssetHashes(projectRoot)).toEqual(true);
    expect(JSON.parse(readFileSync(output, "utf8"))).toEqual({
      "/3D/models/new.glb": hash("new model"),
      "/3D/models/utm.glb": hash("original"),
    });
  });
});
