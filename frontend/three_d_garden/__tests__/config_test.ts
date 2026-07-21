import { clone } from "lodash";
import {
  cameraOperationDurationMs, CAMERA_OPERATION_DURATION_MS,
  CAMERA_OPERATION_RPI_DURATION_MS, DEMO_CAMERA_OPERATION_DURATION_MS,
  getSeasonProperties, INITIAL, modifyConfig, modifyConfigsFromUrlParams,
} from "../config";

describe("modifyConfig()", () => {
  it("uses three seconds for every camera operation", () => {
    expect(cameraOperationDurationMs("rpi"))
      .toEqual(CAMERA_OPERATION_RPI_DURATION_MS);
    expect(cameraOperationDurationMs("farmbot_demo"))
      .toEqual(CAMERA_OPERATION_DURATION_MS);
    expect(cameraOperationDurationMs())
      .toEqual(CAMERA_OPERATION_DURATION_MS);
    expect(cameraOperationDurationMs(undefined, "weeds", true))
      .toEqual(DEMO_CAMERA_OPERATION_DURATION_MS);
    expect(cameraOperationDurationMs(undefined, "calibration", true))
      .toEqual(DEMO_CAMERA_OPERATION_DURATION_MS);
    expect(new Set([
      CAMERA_OPERATION_DURATION_MS,
      CAMERA_OPERATION_RPI_DURATION_MS,
      DEMO_CAMERA_OPERATION_DURATION_MS,
    ])).toEqual(new Set([3000]));
  });

  it("enables labels on hover by default", () => {
    expect(INITIAL.labelsOnHover).toEqual(true);
    expect(INITIAL.constellations).toEqual(false);
    expect(INITIAL.constellationsDebug).toEqual(false);
  });

  it("modifies config: lab", () => {
    const initial = clone(INITIAL);
    const result = modifyConfig(initial, { scene: "Lab" });
    expect(initial.people).toEqual(false);
    expect(result.people).toEqual(true);
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

  it("uses scene-specific ground textures", () => {
    expect(modifyConfig(clone(INITIAL), { scene: "Greenhouse" }).groundTexture)
      .toEqual("bricks");
    expect(modifyConfig(clone(INITIAL), { scene: "Mars" }).groundTexture)
      .toEqual("sand");
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

  it("uses the latest geometry for an unknown kit version", () => {
    const initial = clone(INITIAL);
    const result = modifyConfig(initial, { kitVersion: "v1000" });
    expect(result.kitVersion).toEqual("v1000");
    expect(result.zAxisLength).toEqual(800);
  });
});

describe("modifyConfigsFromUrlParams()", () => {
  it("sets config scene", () => {
    window.location.search = "?scene=Lab";
    const initial = clone(INITIAL);
    initial.people = false;
    const result = modifyConfigsFromUrlParams(initial);
    expect(result.people).toEqual(true);
  });

  it("sets other config", () => {
    window.location.search =
      "?kit=JR&x=1&ground=true&constellations=true"
      + "&constellationsDebug=true";
    const initial = clone(INITIAL);
    initial.sizePreset = "Genesis XL";
    initial.x = 100;
    initial.ground = false;
    const result = modifyConfigsFromUrlParams(initial);
    expect(result.sizePreset).toEqual("Jr");
    expect(result.x).toEqual(1);
    expect(result.ground).toEqual(true);
    expect(result.constellations).toEqual(true);
    expect(result.constellationsDebug).toEqual(true);
  });
});

describe("getSeasonProperties()", () => {
  it("returns params", () => {
    const config = clone(INITIAL);
    config.plants = "Random";
    expect(getSeasonProperties(config, "Summer").cloudOpacity).toEqual(0);
  });
});
