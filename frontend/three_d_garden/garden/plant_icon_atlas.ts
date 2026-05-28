import {
  PLANT_ICON_ATLAS_CELL_HEIGHT,
  PLANT_ICON_ATLAS_CELL_WIDTH,
  PLANT_ICON_ATLAS_COLUMNS,
  PLANT_ICON_ATLAS_FRAMES,
  PLANT_ICON_ATLAS_ICON_SLUGS,
  PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
  PLANT_ICON_ATLAS_TEXTURE_WIDTH,
  PLANT_ICON_ATLAS_URL,
} from "./generated_plant_icon_atlas";
import {
  PROMO_PLANT_ICON_ATLAS_CELL_HEIGHT,
  PROMO_PLANT_ICON_ATLAS_CELL_WIDTH,
  PROMO_PLANT_ICON_ATLAS_COLUMNS,
  PROMO_PLANT_ICON_ATLAS_FRAMES,
  PROMO_PLANT_ICON_ATLAS_ICON_SLUGS,
  PROMO_PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
  PROMO_PLANT_ICON_ATLAS_TEXTURE_WIDTH,
  PROMO_PLANT_ICON_ATLAS_URL,
} from "./generated_promo_plant_icon_atlas";
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

export type PlantIconAtlas = Record<string, PlantIconAtlasFrame>;

interface GeneratedPlantIconAtlas {
  atlasUrl: string;
  textureWidth: number;
  textureHeight: number;
  cellWidth: number;
  cellHeight: number;
  columns: number;
  iconSlugs: string;
  frames: readonly (readonly [string, number, number, number, number])[];
}

export const GENERIC_PLANT_ICON = "/crops/icons/generic-plant.avif";
export const LAVENDER_ICON = "/crops/icons/lavender.avif";

const fullPlantIconAtlas: GeneratedPlantIconAtlas = {
  atlasUrl: PLANT_ICON_ATLAS_URL,
  textureWidth: PLANT_ICON_ATLAS_TEXTURE_WIDTH,
  textureHeight: PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
  cellWidth: PLANT_ICON_ATLAS_CELL_WIDTH,
  cellHeight: PLANT_ICON_ATLAS_CELL_HEIGHT,
  columns: PLANT_ICON_ATLAS_COLUMNS,
  iconSlugs: PLANT_ICON_ATLAS_ICON_SLUGS,
  frames: PLANT_ICON_ATLAS_FRAMES,
};

const promoPlantIconAtlas: GeneratedPlantIconAtlas = {
  atlasUrl: PROMO_PLANT_ICON_ATLAS_URL,
  textureWidth: PROMO_PLANT_ICON_ATLAS_TEXTURE_WIDTH,
  textureHeight: PROMO_PLANT_ICON_ATLAS_TEXTURE_HEIGHT,
  cellWidth: PROMO_PLANT_ICON_ATLAS_CELL_WIDTH,
  cellHeight: PROMO_PLANT_ICON_ATLAS_CELL_HEIGHT,
  columns: PROMO_PLANT_ICON_ATLAS_COLUMNS,
  iconSlugs: PROMO_PLANT_ICON_ATLAS_ICON_SLUGS,
  frames: PROMO_PLANT_ICON_ATLAS_FRAMES,
};

const compactAtlasFrames = (atlas: GeneratedPlantIconAtlas) =>
  atlas.iconSlugs.split(",").map((slug, index) => [
    `/crops/icons/${slug}.avif`,
    (index % atlas.columns) * atlas.cellWidth,
    Math.floor(index / atlas.columns) * atlas.cellHeight,
    atlas.cellWidth,
    atlas.cellHeight,
  ] as const);

const plantIconAtlasFrames = (atlas: GeneratedPlantIconAtlas) =>
  atlas.iconSlugs
    ? compactAtlasFrames(atlas)
    : atlas.frames;

const buildPlantIconAtlas = (
  atlas: GeneratedPlantIconAtlas,
): PlantIconAtlas =>
  Object.fromEntries(
    plantIconAtlasFrames(atlas)
      .map(([icon, x, y, width, height]) => [
        icon,
        {
          atlasUrl: atlas.atlasUrl,
          textureWidth: atlas.textureWidth,
          textureHeight: atlas.textureHeight,
          x,
          y,
          width,
          height,
        },
      ]),
  );

export const PLANT_ICON_ATLAS = buildPlantIconAtlas(fullPlantIconAtlas);

export const PROMO_PLANT_ICON_ATLAS =
  buildPlantIconAtlas(promoPlantIconAtlas);

export const getPlantIconTextureUrl = (
  icon: string,
  atlas: PlantIconAtlas = PLANT_ICON_ATLAS,
): string =>
  atlas[icon]?.atlasUrl || icon;

export const getPlantIconTextureTransform =
  (
    icon: string,
    atlas: PlantIconAtlas = PLANT_ICON_ATLAS,
  ): PlantIconTextureTransform | undefined => {
    const frame = atlas[icon];
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

export const getPlantIconTexture = (
  baseTexture: Texture,
  icon: string,
  atlas: PlantIconAtlas = PLANT_ICON_ATLAS,
) => {
  const transform = getPlantIconTextureTransform(icon, atlas);
  if (!transform) { return baseTexture; }

  const atlasTexture = baseTexture.clone();
  atlasTexture.offset?.set(transform.offset[0], transform.offset[1]);
  atlasTexture.repeat?.set(transform.repeat[0], transform.repeat[1]);
  atlasTexture.needsUpdate = true;

  return atlasTexture;
};
