const mockStorj: Dictionary<boolean> = {};

jest.mock("../../session", () => {
  return {
    Session: {
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../session_keys";
import { getDefaultAxisLength, getGridSize } from "../index";

describe("getDefaultAxisLength()", () => {
  it("returns axis lengths", () => {
    const axes = getDefaultAxisLength();
    expect(axes).toEqual({ x: 2900, y: 1400 });
  });

  it("returns XL axis lengths", () => {
    mockStorj[BooleanSetting.map_xl] = true;
    const axes = getDefaultAxisLength();
    expect(axes).toEqual({ x: 5900, y: 2900 });
  });
});

describe("getGridSize()", () => {
  it("returns default grid size", () => {
    mockStorj[BooleanSetting.map_xl] = false;
    const grid = getGridSize({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
    expect(grid).toEqual({ x: 2900, y: 1400 });
  });

  it("returns XL grid size", () => {
    mockStorj[BooleanSetting.map_xl] = true;
    const grid = getGridSize({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
    expect(grid).toEqual({ x: 5900, y: 2900 });
  });

  it("returns grid size using bot size", () => {
    mockStorj[BooleanSetting.dynamic_map] = true;
    const grid = getGridSize({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
    expect(grid).toEqual({ x: 100, y: 200 });
  });
});
