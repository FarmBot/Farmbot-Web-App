import { useTexture } from "@react-three/drei";
import { Texture, type Wrapping } from "three";

export interface TextureVariantOptions {
  wrapS?: Wrapping;
  wrapT?: Wrapping;
  repeat?: [number, number];
  offset?: [number, number];
  rotation?: number;
}

const textureVariantCache = new WeakMap<Texture, Map<string, Texture>>();

export const textureVariantKey = (options: TextureVariantOptions): string =>
  [
    options.wrapS ?? "",
    options.wrapT ?? "",
    options.repeat?.join(",") ?? "",
    options.offset?.join(",") ?? "",
    options.rotation ?? "",
  ].join("|");

export const getTextureVariant = (
  baseTexture: Texture,
  options: TextureVariantOptions,
): Texture => {
  const key = textureVariantKey(options);
  const variants = textureVariantCache.get(baseTexture) || new Map<string, Texture>();
  const existing = variants.get(key);
  if (existing) { return existing; }

  const texture = baseTexture.clone();
  if (options.wrapS != undefined) { texture.wrapS = options.wrapS; }
  if (options.wrapT != undefined) { texture.wrapT = options.wrapT; }
  if (options.repeat) { texture.repeat.set(...options.repeat); }
  if (options.offset) { texture.offset.set(...options.offset); }
  if (options.rotation != undefined) { texture.rotation = options.rotation; }
  texture.needsUpdate = true;

  variants.set(key, texture);
  textureVariantCache.set(baseTexture, variants);
  return texture;
};

export const useTextureVariant = (
  url: string,
  options: TextureVariantOptions,
): Texture => {
  const baseTexture = useTexture(url);
  return getTextureVariant(baseTexture, options);
};
