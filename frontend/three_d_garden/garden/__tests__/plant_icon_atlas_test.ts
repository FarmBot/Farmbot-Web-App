import {
  PLANT_ICON_ATLAS,
  getPlantIconTexture,
  getPlantIconTextureTransform,
  getPlantIconTextureUrl,
} from "../plant_icon_atlas";
import { Texture } from "three";

describe("plant icon atlas helpers", () => {
  const icon = "/crops/icons/mint.avif";

  afterEach(() => {
    delete PLANT_ICON_ATLAS[icon];
  });

  it("falls back to the original icon url", () => {
    delete PLANT_ICON_ATLAS[icon];
    expect(getPlantIconTextureUrl(icon)).toEqual(icon);
    expect(getPlantIconTextureTransform(icon)).toBeUndefined();
  });

  it("resolves atlas url and UV transform", () => {
    PLANT_ICON_ATLAS[icon] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 128,
      x: 64,
      y: 16,
      width: 32,
      height: 48,
    };

    expect(getPlantIconTextureUrl(icon)).toEqual("/crops/icons/atlas.avif");
    expect(getPlantIconTextureTransform(icon)).toEqual({
      offset: [0.25, 0.5],
      repeat: [0.125, 0.375],
    });
  });

  it("gets atlas textures per base texture and icon", () => {
    PLANT_ICON_ATLAS[icon] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 128,
      x: 64,
      y: 16,
      width: 32,
      height: 48,
    };
    const baseTexture = new Texture();

    const texture = getPlantIconTexture(baseTexture, icon);

    expect(texture).not.toBe(baseTexture);
  });
});
