import React from "react";
import {
  FrontSide, MeshStandardMaterial, NoColorSpace, TextureSource,
} from "three";
import { range } from "lodash";
import { getBotVersion } from "./bot_versions";
import {
  TOOL_PALETTES, ToolPaletteName, useToolPlasticMaterial,
} from "./tool_palettes";

export type ToolHardwarePaletteName = ToolPaletteName | "rotaryTool";

const SILVER_SWATCHES: Record<ToolHardwarePaletteName, readonly number[]> = {
  utm: [],
  seeder: [2, 3, 6],
  weeder: [2, 3, 4, 5],
  wateringNozzle: [0, 1, 3],
  soilSensor: [1, 2, 3, 6],
  rotaryTool: [0, 1, 5, 9, 10, 11, 16],
};

const gray = (value: number) => {
  const channel = Math.round(value * 255);
  return `rgb(${channel}, ${channel}, ${channel})`;
};

export const createToolHardwareMaterial = (
  original: MeshStandardMaterial,
  palette: ToolHardwarePaletteName,
  baseColor?: string,
): MeshStandardMaterial => {
  if (!original.map) { return original; }
  const image = original.map.image as
    HTMLImageElement | ImageBitmap | HTMLCanvasElement;
  const canvases = range(3).map(() => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    return canvas;
  });
  const [color, metalness, roughness] = canvases.map(c => c.getContext("2d"));
  if (!color || !metalness || !roughness) { return original; }
  color.drawImage(image, 0, 0);
  if (baseColor) {
    color.fillStyle = baseColor;
    color.fillRect(0, 0, image.width, image.height);
  }
  metalness.fillStyle = gray(original.metalness);
  metalness.fillRect(0, 0, image.width, image.height);
  roughness.fillStyle = gray(original.roughness);
  roughness.fillRect(0, 0, image.width, image.height);
  metalness.fillStyle = gray(0.6);
  roughness.fillStyle = gray(0.35);
  const columns = palette == "rotaryTool"
    ? 32
    : TOOL_PALETTES[palette].columns;
  const width = image.width / columns;
  const paint = (swatches: readonly number[], finish: string) => {
    color.fillStyle = finish;
    swatches.forEach(column => {
      for (const context of [color, metalness, roughness]) {
        context.fillRect(column * width, 0, width, image.height);
      }
    });
  };
  paint(SILVER_SWATCHES[palette], "silver");
  if (palette == "utm") { paint([TOOL_PALETTES.utm.entries.barbs], "gold"); }
  const textures = canvases.map((canvas, i) => {
    const texture = original.map!.clone();
    texture.source = new TextureSource(canvas);
    if (i > 0) { texture.colorSpace = NoColorSpace; }
    texture.needsUpdate = true;
    return texture;
  });
  const material = original.clone();
  [material.map, material.metalnessMap, material.roughnessMap] = textures;
  material.metalness = 1;
  material.roughness = 1;
  return material;
};

export const useToolHardware = (
  original: MeshStandardMaterial,
  palette: ToolHardwarePaletteName,
  baseColor?: string,
) => {
  const material = React.useMemo(() =>
    createToolHardwareMaterial(original, palette, baseColor),
  [original, palette, baseColor]);
  const hardwareMaterial = React.useMemo(() => new MeshStandardMaterial({
    color: "silver", metalness: 0.6, roughness: 0.35,
    side: original.side ?? FrontSide,
  }), [original.side]);
  React.useEffect(() => () => {
    if (material != original) {
      material.map?.dispose();
      material.metalnessMap?.dispose();
      material.roughnessMap?.dispose();
      material.dispose();
    }
  }, [material, original]);
  React.useEffect(() => () => { hardwareMaterial.dispose(); }, [hardwareMaterial]);
  return { material, hardwareMaterial };
};

export const useToolMaterials = (
  original: MeshStandardMaterial,
  kitVersion: string,
  palette: ToolPaletteName,
) => {
  const baseColor = palette == "utm"
    ? getBotVersion(kitVersion).toolColor ?? "#ccc"
    : undefined;
  const body = useToolPlasticMaterial(original, kitVersion, palette);
  return useToolHardware(body, palette, baseColor);
};
