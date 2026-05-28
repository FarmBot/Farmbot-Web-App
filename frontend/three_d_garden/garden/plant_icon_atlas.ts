import {
  PLANT_ICON_ATLAS_FRAMES,
  PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
  PLANT_ICON_ATLAS_TEXTURE_WIDTH,
  PLANT_ICON_ATLAS_URL,
} from "./generated_plant_icon_atlas";
import { Texture } from "three";

export interface PlantIconAtlasFrame {
  atlasUrl: string;
  textureWidth: number;
  textureHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlantIconTextureTransform {
  offset: [number, number];
  repeat: [number, number];
}

export const PLANT_ICON_ATLAS = Object.fromEntries(
  PLANT_ICON_ATLAS_FRAMES.map(([icon, x, y, width, height]) => [
    icon,
    {
      atlasUrl: PLANT_ICON_ATLAS_URL,
      textureWidth: PLANT_ICON_ATLAS_TEXTURE_WIDTH,
      textureHeight: PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
      x,
      y,
      width,
      height,
    },
  ]),
) as Record<string, PlantIconAtlasFrame>;

export const getPlantIconTextureUrl = (icon: string): string =>
  PLANT_ICON_ATLAS[icon]?.atlasUrl || icon;

export const getPlantIconTextureTransform =
  (icon: string): PlantIconTextureTransform | undefined => {
    const frame = PLANT_ICON_ATLAS[icon];
    if (!frame) { return undefined; }
    return {
      offset: [
        frame.x / frame.textureWidth,
        1 - ((frame.y + frame.height) / frame.textureHeight),
      ],
      repeat: [
        frame.width / frame.textureWidth,
        frame.height / frame.textureHeight,
      ],
    };
  };

export const getPlantIconTexture = (baseTexture: Texture, icon: string) => {
  const transform = getPlantIconTextureTransform(icon);
  if (!transform) { return baseTexture; }

  const atlasTexture = baseTexture.clone();
  atlasTexture.offset?.set(transform.offset[0], transform.offset[1]);
  atlasTexture.repeat?.set(transform.repeat[0], transform.repeat[1]);
  atlasTexture.needsUpdate = true;

  return atlasTexture;
};
