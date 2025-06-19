import { clone } from "lodash";
import {
  detailLevels, getSeasonProperties, INITIAL, modifyConfig,
  modifyConfigsFromUrlParams,
} from "../config";

describe("modifyConfig()", () => {
  it("modifies config: lab", () => {
    const initial = clone(INITIAL);
    const result = modifyConfig(initial, { scene: "Lab" });
    expect(initial.lab).toEqual(false);
    expect(result.lab).toEqual(true);
    expect(initial.clouds).toEqual(true);
    expect(result.clouds).toEqual(false);
    expect(initial.bedType).toEqual("Standard");
    expect(result.bedType).toEqual("Mobile");
  });

  it("modifies config: lab XL", () => {
    const initial = clone(INITIAL);
    const result = modifyConfig(initial, {
      scene: "Lab",
      sizePreset: "Genesis XL",
    });
    expect(initial.bedType).toEqual("Standard");
    expect(result.bedType).toEqual("Standard");
  });

  it("modifies config: Jr", () => {
    const initial = clone(INITIAL);
    const result = modifyConfig(initial, { sizePreset: "Jr" });
    expect(initial.x).toEqual(300);
    expect(result.x).toEqual(100);
  });

  it("modifies config: bedType", () => {
    const initial = clone(INITIAL);
    initial.bedZOffset = 100;
    initial.bedType = "Mobile";
    const result = modifyConfig(initial, { bedType: "Standard" });
    expect(result.bedZOffset).toEqual(0);
  });

  it("resets config", () => {
    const initial = clone(INITIAL);
    initial.bedLengthOuter = 1;
    const result = modifyConfig(initial, { otherPreset: "Reset all" });
    expect(result.bedLengthOuter).toEqual(3000);
  });

  it("modifies config: preset", () => {
    const initial = clone(INITIAL);
    initial.bedHeight = 1;
    const result = modifyConfig(initial, { otherPreset: "Initial" });
    expect(result.bedHeight).toEqual(300);
  });
});

describe("modifyConfigsFromUrlParams()", () => {
  it("sets config scene", () => {
    window.location.search = "?scene=Lab";
    const initial = clone(INITIAL);
    initial.lab = false;
    const result = modifyConfigsFromUrlParams(initial);
    expect(result.lab).toEqual(true);
  });

  it("sets other config", () => {
    window.location.search = "?kit=JR&x=1&ground=true";
    const initial = clone(INITIAL);
    initial.sizePreset = "Genesis XL";
    initial.x = 100;
    initial.ground = false;
    const result = modifyConfigsFromUrlParams(initial);
    expect(result.sizePreset).toEqual("Jr");
    expect(result.x).toEqual(1);
    expect(result.ground).toEqual(true);
  });
});

describe("detailLevels()", () => {
  it("returns detail level", () => {
    const config = clone(INITIAL);
    config.lowDetail = true;
    expect(detailLevels(config)).toEqual([0, 0]);
  });
});

describe("getSeasonProperties()", () => {
  it("returns params", () => {
    const config = clone(INITIAL);
    config.plants = "Random";
    expect(getSeasonProperties(config, "Summer").cloudOpacity).toEqual(0);
  });
});
