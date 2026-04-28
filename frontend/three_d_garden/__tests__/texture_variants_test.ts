import { RepeatWrapping, Texture } from "three";
import { renderHook } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import {
  getTextureVariant, textureVariantKey, useTextureVariant,
} from "../texture_variants";

describe("texture variants", () => {
  it("builds stable keys", () => {
    expect(textureVariantKey({
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      repeat: [0.02, 0.05],
      offset: [0.25, 0.5],
      rotation: Math.PI / 2,
    })).toEqual("1000|1000|0.02,0.05|0.25,0.5|1.5707963267948966");
  });

  it("reuses identical variants for the same base texture", () => {
    const baseTexture = new Texture();
    const options = {
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      repeat: [0.02, 0.05] as [number, number],
    };

    const first = getTextureVariant(baseTexture, options);
    const second = getTextureVariant(baseTexture, options);

    expect(first).toBe(second);
    expect(first).not.toBe(baseTexture);
    expect(first.wrapS).toEqual(RepeatWrapping);
    expect(first.wrapT).toEqual(RepeatWrapping);
    expect(first.repeat.x).toEqual(0.02);
    expect(first.repeat.y).toEqual(0.05);
  });

  it("keeps different variant options isolated", () => {
    const baseTexture = new Texture();

    const first = getTextureVariant(baseTexture, {
      wrapS: RepeatWrapping,
      repeat: [0.02, 0.05],
    });
    const second = getTextureVariant(baseTexture, {
      wrapS: RepeatWrapping,
      repeat: [0.3, 0.3],
    });

    expect(first).not.toBe(second);
    expect(first.repeat.x).toEqual(0.02);
    expect(second.repeat.x).toEqual(0.3);
  });

  it("loads a base texture and returns a cached variant", () => {
    (useTexture as unknown as jest.Mock).mockClear();

    const { result } = renderHook(() =>
      useTextureVariant("/3D/textures/wood.avif", {
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        repeat: [0.02, 0.05],
      }));

    expect(useTexture).toHaveBeenCalledWith("/3D/textures/wood.avif");
    expect(result.current.wrapS).toEqual(RepeatWrapping);
    expect(result.current.wrapT).toEqual(RepeatWrapping);
  });
});
