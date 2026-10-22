import { renderHook } from "@testing-library/react";
import {
  BackSide, CanvasTexture, DoubleSide, FrontSide, MeshStandardMaterial,
  NoColorSpace, SRGBColorSpace,
} from "three";
import {
  createToolHardwareMaterial, ToolHardwarePaletteName, useToolHardware,
  useToolMaterials,
} from "../tool_hardware";

const fakeMaterial = (columns: number) => {
  const image = document.createElement("canvas");
  image.width = columns * 4;
  image.height = 4;
  const map = new CanvasTexture(image);
  map.colorSpace = SRGBColorSpace;
  map.flipY = false;
  return new MeshStandardMaterial({ map });
};

describe("createToolHardwareMaterial()", () => {
  it.each<[ToolHardwarePaletteName, number, number[]]>([
    ["seeder", 8, [2, 3, 6]],
    ["weeder", 8, [2, 3, 4, 5]],
    ["wateringNozzle", 8, [0, 1, 3]],
    ["soilSensor", 16, [1, 2, 3, 6]],
    ["rotaryTool", 32, [0, 1, 5, 9, 10, 11, 16]],
    // eslint-disable-next-line complexity
  ])("recolors whole %s swatches", (palette, columns, swatches) => {
    const original = fakeMaterial(columns);
    const material = createToolHardwareMaterial(original, palette);
    const canvas = material.map?.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    expect(material).not.toBe(original);
    expect(context?.drawImage).toHaveBeenCalledWith(original.map?.image, 0, 0);
    expect(context?.fillStyle).toEqual("#c0c0c0");
    expect(context?.fillRect).toHaveBeenCalledTimes(swatches.length);
    swatches.forEach(column =>
      expect(context?.fillRect).toHaveBeenCalledWith(column * 4, 0, 4, 4));
    expect(material.map?.source).not.toBe(original.map?.source);
    expect(material.map?.colorSpace).toEqual(SRGBColorSpace);
    expect(material.map?.flipY).toEqual(false);
    expect(material.metalnessMap?.colorSpace).toEqual(NoColorSpace);
    expect(material.roughnessMap?.colorSpace).toEqual(NoColorSpace);
    for (const texture of [material.metalnessMap, material.roughnessMap]) {
      const mask = texture?.image as HTMLCanvasElement;
      const maskContext = mask.getContext("2d");
      expect(maskContext?.fillRect).toHaveBeenCalledTimes(swatches.length + 1);
      expect(maskContext?.fillRect)
        .toHaveBeenNthCalledWith(1, 0, 0, columns * 4, 4);
      swatches.forEach(column =>
        expect(maskContext?.fillRect).toHaveBeenCalledWith(column * 4, 0, 4, 4));
    }
    expect(original.metalnessMap).toBeNull();
    expect(original.roughnessMap).toBeNull();
    expect(original.metalness).toEqual(0);
    expect(original.roughness).toEqual(1);
  });

  it("leaves untextured materials unchanged", () => {
    const original = new MeshStandardMaterial();
    expect(createToolHardwareMaterial(original, "seeder")).toBe(original);
  });

  it("keeps the original material when canvas is unavailable", () => {
    const original = fakeMaterial(8);
    const context = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockReturnValue(null);
    try {
      expect(createToolHardwareMaterial(original, "seeder")).toBe(original);
    } finally {
      context.mockRestore();
    }
  });
});

describe("useToolHardware()", () => {
  it.each([undefined, FrontSide, BackSide, DoubleSide])(
    "handles source material side %s without warnings", side => {
      const original = new MeshStandardMaterial();
      if (side === undefined) {
        Reflect.deleteProperty(original, "side");
      } else {
        original.side = side;
      }
      const warning = jest.spyOn(console, "warn").mockImplementation(jest.fn());
      try {
        const { result, unmount } = renderHook(() =>
          useToolHardware(original, "seeder"));
        expect(result.current.hardwareMaterial.side).toEqual(side ?? FrontSide);
        expect(warning).not.toHaveBeenCalled();
        unmount();
      } finally {
        warning.mockRestore();
      }
    },
  );
});

describe("useToolMaterials()", () => {
  it.each([
    ["v1.2", "#333333"],
    ["v1.3", "#cccccc"],
    ["v1.7", "#cccccc"],
    ["v1.8", "#cccccc"],
    ["v1.9", "#cccccc"],
  ])("makes UTM barbs gold and preserves the %s body", (version, bodyColor) => {
    const original = fakeMaterial(16);
    const fills: { color: string; rect: number[] }[] = [];
    const drawings: jest.SpyInstance[] = [];
    const createElement = document.createElement.bind(document);
    const create = jest.spyOn(document, "createElement")
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      .mockImplementation(((tag: string) => {
        const element = createElement(tag);
        if (tag == "canvas") {
          const context = (element as HTMLCanvasElement).getContext("2d")!;
          drawings.push(jest.spyOn(context, "fillRect")
            .mockImplementation((...rect) => {
              fills.push({ color: String(context.fillStyle), rect });
            }));
        }
        return element;
      }) as typeof document.createElement);
    try {
      const { result, unmount } = renderHook(() =>
        useToolMaterials(original, version, "utm"));
      expect(fills).toContainEqual({ color: bodyColor, rect: [0, 0, 64, 4] });
      expect(fills).toContainEqual({ color: "#ffd700", rect: [0, 0, 4, 4] });
      expect(result.current.material.metalnessMap).toBeDefined();
      expect(result.current.material.roughnessMap).toBeDefined();
      const image = original.map?.image as HTMLCanvasElement;
      expect(image.width).toEqual(64);
      unmount();
    } finally {
      create.mockRestore();
      drawings.forEach(drawing => drawing.mockRestore());
    }
  });

  it("preserves version plastic colors and disposes only owned resources", () => {
    const original = fakeMaterial(8);
    const image = original.map?.image;
    const { result, rerender, unmount } = renderHook(({ version }) =>
      useToolMaterials(original, version, "seeder"), {
      initialProps: { version: "v1.9" },
    });
    const hardware = result.current.hardwareMaterial;
    const initial = result.current.material;
    const initialDispose = jest.spyOn(initial, "dispose");
    const initialMapDispose = jest.spyOn(initial.map!, "dispose");
    rerender({ version: "v1.9" });
    expect(result.current.material).toBe(initial);
    rerender({ version: "v1.2" });
    expect(initialDispose).toHaveBeenCalledTimes(1);
    expect(initialMapDispose).toHaveBeenCalledTimes(1);
    expect(result.current.hardwareMaterial).toBe(hardware);
    const material = result.current.material;
    const canvas = material.map?.image as HTMLCanvasElement;
    const drawImage = canvas.getContext("2d")?.drawImage as jest.Mock;
    const body = drawImage.mock.calls[0][0] as HTMLCanvasElement;
    expect(body.getContext("2d")?.fillStyle).toEqual("#333333");
    expect(original.map?.image).toBe(image);
    const owned = [material, material.map!, material.metalnessMap!,
      material.roughnessMap!, hardware];
    const disposals = owned.map(resource => jest.spyOn(resource, "dispose"));
    const originalDispose = jest.spyOn(original, "dispose");
    const originalMapDispose = jest.spyOn(original.map!, "dispose");
    unmount();
    disposals.forEach(dispose => expect(dispose).toHaveBeenCalledTimes(1));
    expect(originalDispose).not.toHaveBeenCalled();
    expect(originalMapDispose).not.toHaveBeenCalled();
  });
});
