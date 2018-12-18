import { getDefaultAxisLength, getGridSize } from "../index";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";

describe("getDefaultAxisLength()", () => {
  it("returns axis lengths", () => {
    const axes = getDefaultAxisLength(() => false);
    expect(axes).toEqual({ x: 2900, y: 1400 });
  });

  it("returns XL axis lengths", () => {
    const axes = getDefaultAxisLength(() => true);
    expect(axes).toEqual({ x: 5900, y: 2900 });
  });
});

describe("getGridSize()", () => {
  it("returns default grid size", () => {
    const grid = getGridSize(
      k => ({ dynamic_map: false, map_xl: false } as WebAppConfig)[k], {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false }
      });
    expect(grid).toEqual({ x: 2900, y: 1400 });
  });

  it("returns XL grid size", () => {
    const grid = getGridSize(
      k => ({ dynamic_map: false, map_xl: true } as WebAppConfig)[k], {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false }
      });
    expect(grid).toEqual({ x: 5900, y: 2900 });
  });

  it("returns grid size using bot size", () => {
    const grid = getGridSize(
      k => ({ dynamic_map: true, map_xl: false } as WebAppConfig)[k], {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false }
      });
    expect(grid).toEqual({ x: 100, y: 200 });
  });
});
