import { renderHook } from "@testing-library/react";
import {
  CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace,
} from "three";
import { ToolPaletteName, useToolPlasticMaterial } from "../tool_palettes";

describe("tool plastic palettes", () => {
  const fakeMaterial = (columns: number) => {
    const image = document.createElement("canvas");
    image.width = columns * 4;
    image.height = 4;
    const map = new CanvasTexture(image);
    map.flipY = false;
    map.wrapS = RepeatWrapping;
    map.colorSpace = SRGBColorSpace;
    return new MeshStandardMaterial({ map });
  };

  it.each<[ToolPaletteName, number, number]>([
    ["seeder", 8, 1],
    ["weeder", 8, 0],
    ["wateringNozzle", 8, 2],
    ["soilSensor", 16, 0],
  ])("recolors only the %s body swatch", (palette, columns, bodyColumn) => {
    const original = fakeMaterial(columns);
    const source = original.map?.source;
    const image = original.map?.image;
    const { result, unmount } = renderHook(() =>
      useToolPlasticMaterial(original, "v1.2", palette));
    const material = result.current;
    const canvas = material.map?.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    expect(material).not.toBe(original);
    expect(material.color).toEqual(original.color);
    expect(material.map).not.toBe(original.map);
    expect(material.map?.source).not.toBe(source);
    expect(canvas.width).toEqual(columns * 4);
    expect(canvas.height).toEqual(4);
    expect(context?.drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(context?.fillRect).toHaveBeenCalledTimes(1);
    expect(context?.fillRect).toHaveBeenCalledWith(bodyColumn * 4, 0, 4, 4);
    expect(context?.fillStyle).toEqual("#333333");
    expect(material.map?.flipY).toEqual(false);
    expect(material.map?.wrapS).toEqual(RepeatWrapping);
    expect(material.map?.colorSpace).toEqual(SRGBColorSpace);
    expect(original.map?.source).toBe(source);
    expect(original.map?.image).toBe(image);
    unmount();
  });

  it.each(["v1.3", "v1.7", "v1.8", "v1.9"])(
    "preserves the original material for %s", kitVersion => {
      const original = fakeMaterial(8);
      const { result } = renderHook(() =>
        useToolPlasticMaterial(original, kitVersion, "seeder"));
      expect(result.current).toBe(original);
    },
  );

  it("leaves untextured materials unchanged", () => {
    const original = new MeshStandardMaterial();
    const { result } = renderHook(() =>
      useToolPlasticMaterial(original, "v1.2", "seeder"));
    expect(result.current).toBe(original);
  });

  it("leaves the original material when canvas is unavailable", () => {
    const original = fakeMaterial(8);
    const contextSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockReturnValue(null);
    try {
      const { result } = renderHook(() =>
        useToolPlasticMaterial(original, "v1.2", "seeder"));
      expect(result.current).toBe(original);
    } finally {
      contextSpy.mockRestore();
    }
  });

  it("reuses and disposes only the recolored material and map", () => {
    const original = fakeMaterial(8);
    const originalDispose = jest.spyOn(original, "dispose");
    const originalMapDispose = jest.spyOn(original.map!, "dispose");
    const { result, rerender, unmount } = renderHook(({ kitVersion }) =>
      useToolPlasticMaterial(original, kitVersion, "seeder"), {
      initialProps: { kitVersion: "v1.2" },
    });
    const material = result.current;
    const materialDispose = jest.spyOn(material, "dispose");
    const mapDispose = jest.spyOn(material.map!, "dispose");
    rerender({ kitVersion: "v1.2" });
    expect(result.current).toBe(material);
    expect(materialDispose).not.toHaveBeenCalled();
    rerender({ kitVersion: "v1.3" });
    expect(result.current).toBe(original);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(mapDispose).toHaveBeenCalledTimes(1);
    unmount();
    expect(originalDispose).not.toHaveBeenCalled();
    expect(originalMapDispose).not.toHaveBeenCalled();
  });
});
