import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION, PRESETS } from "../../config";
import { getBotKinematics, getCameraDistanceToSoil } from "../kinematics";
import { getBotVersion } from "../bot_versions";

describe("FarmBot kinematics", () => {
  it.each(["v1.7", "v1.8", "v1.9"])(
    "builds axis-aligned frames for %s",
    kitVersion => {
      const config = { ...clone(INITIAL), kitVersion };
      const result = getBotKinematics(config, INITIAL_POSITION);
      expect(result.gantryPosition).toEqual([300, 0, 0]);
      expect(result.crossSlidePosition[1]).toEqual(
        kitVersion == "v1.9" ? 745 : 705,
      );
      expect(result.anchors.utm.worldPosition[2]).toEqual(200);
    },
  );

  it.each(["Jr", "Genesis", "Genesis XL"])(
    "places the machine origin for %s",
    sizePreset => {
      const config = clone(PRESETS[sizePreset]);
      const result = getBotKinematics(config, INITIAL_POSITION);
      expect(result.machineOrigin).toEqual([
        config.bedXOffset - config.bedLengthOuter / 2,
        config.bedYOffset - config.bedWidthOuter / 2,
        0,
      ]);
    },
  );

  it("moves only the requested frame", () => {
    const config = clone(INITIAL);
    const initial = getBotKinematics(config, INITIAL_POSITION);
    const moved = getBotKinematics(config, {
      x: INITIAL_POSITION.x + 10,
      y: INITIAL_POSITION.y + 20,
      z: INITIAL_POSITION.z - 30,
    });
    expect(moved.machineOrigin).toEqual(initial.machineOrigin);
    expect(moved.gantryPosition[0] - initial.gantryPosition[0]).toEqual(10);
    expect(moved.crossSlidePosition[1] - initial.crossSlidePosition[1])
      .toEqual(20);
    expect(moved.zAxisPosition[2] - initial.zAxisPosition[2]).toEqual(-30);
  });

  it("places the v1.9 camera on the cross-slide", () => {
    const config = clone(INITIAL);
    const result = getBotKinematics(config, INITIAL_POSITION);
    expect(result.anchors.camera.frame).toEqual("cross-slide");
    expect(result.anchors.camera.gardenPosition).toEqual({
      x: 200,
      y: 699,
    });
    expect(result.anchors.camera.worldPosition).toEqual([
      -1150,
      39,
      589.5,
    ]);
  });

  it("accounts for positive Z coordinates", () => {
    const config = { ...clone(INITIAL), negativeZ: false };
    const result = getBotKinematics(config, { ...INITIAL_POSITION, z: 200 });
    expect(result.anchors.utm.worldPosition[2]).toEqual(200);
  });

  it("calculates camera distance from the shared camera anchor", () => {
    const config = clone(INITIAL);
    const getZ = jest.fn(() => -100);
    expect(getCameraDistanceToSoil(config, INITIAL_POSITION, getZ))
      .toEqual(289.5);
    expect(getZ).toHaveBeenCalledWith(200, 699);
  });
});

describe("getBotVersion()", () => {
  it("describes supported structural differences", () => {
    expect(getBotVersion("v1.7")).toMatchObject({
      number: "v1.7",
      gantry: "v1.7",
      columnLength: 500,
      yCCSupport: "models",
      electronicsButtonCount: 5,
    });
    expect(getBotVersion("v1.8")).toMatchObject({
      number: "v1.8",
      gantry: "v1.7",
      columnLength: 500,
      yCCSupport: "extrusion",
      yCCDepth: 40,
    });
    expect(getBotVersion("v1.9")).toMatchObject({
      number: "v1.9",
      gantry: "v1.9",
      columnLength: 450,
      cameraFrame: "cross-slide",
      zAxisBelt: true,
    });
  });

  it("uses the v1.9 section for unknown versions", () => {
    expect(getBotVersion("v1000")).toBe(getBotVersion("v1.9"));
  });
});
