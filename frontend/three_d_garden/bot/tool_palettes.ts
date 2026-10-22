import React from "react";
import { MeshStandardMaterial, TextureSource } from "three";
import { getBotVersion } from "./bot_versions";

// Zero-based columns in the GLB palette textures. Each column is four pixels.
export const TOOL_PALETTES = {
  seeder: {
    columns: 8,
    entries: {
      brassInsert: 0,
      plasticBody: 1,
      screwsAndNeedle: 2,
      magnets: 3,
      hoseBarb: 4,
      contactPlate: 5,
      contactScrew: 6,
      needleHub: 7,
    },
  },
  weeder: {
    columns: 8,
    entries: {
      plasticBody: 0, // Includes the integrated tines.
      threadedInserts: 1,
      screws: 2,
      magnetFasteners: 3,
      magnets: 4,
      contactFastener: 5,
      contactPlate: 6,
    },
  },
  wateringNozzle: {
    columns: 8,
    entries: {
      mountingScrews: 0,
      magnets: 1,
      plasticBody: 2,
      contactScrews: 3,
      contactPlate: 4,
    },
  },
  soilSensor: {
    columns: 16,
    entries: {
      plasticBody: 0, // Instanced nuts share this swatch: keep their original map.
      screws: 1,
      magnetFasteners: 2,
      magnets: 3,
      contactHardware: 4,
      copperLead: 5,
      mountingHardware: 6,
      circuitBoard: 7,
      groundLead: 8,
      electricalComponent: 9,
      sensorLead: 10,
      probePlate: 11,
    },
  },
} as const;

export type ToolPaletteName = keyof typeof TOOL_PALETTES;

export const createToolPlasticMaterial = (
  original: MeshStandardMaterial,
  paletteName: ToolPaletteName,
  color: string | undefined,
): MeshStandardMaterial => {
  if (!color || !original.map) { return original; }
  const image = original.map.image as
    HTMLImageElement | ImageBitmap | HTMLCanvasElement;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) { return original; }
  context.drawImage(image, 0, 0);
  const palette = TOOL_PALETTES[paletteName];
  const columnWidth = canvas.width / palette.columns;
  context.fillStyle = color;
  context.fillRect(
    palette.entries.plasticBody * columnWidth, 0, columnWidth, canvas.height,
  );
  const material = original.clone();
  const map = original.map.clone();
  // Texture.clone() shares its source; isolate the recolored image as well.
  map.source = new TextureSource(canvas);
  map.needsUpdate = true;
  material.map = map;
  return material;
};

export const useToolPlasticMaterial = (
  original: MeshStandardMaterial,
  kitVersion: string,
  palette: ToolPaletteName,
) => {
  const color = getBotVersion(kitVersion).toolColor;
  const material = React.useMemo(
    () => createToolPlasticMaterial(original, palette, color),
    [original, palette, color],
  );
  React.useEffect(() => () => {
    if (material != original) {
      material.map?.dispose();
      material.dispose();
    }
  }, [material, original]);
  return material;
};
