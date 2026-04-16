import { clone } from "lodash";
import {
  easyCubicBezierCurve3,
  getColorFromBrightness,
  get3DPositionFunc,
  getGardenPositionFunc,
  getWorldPositionFunc,
  threeSpace,
  zDir,
  zZero,
} from "../helpers";
import { INITIAL } from "../config";
import * as THREE from "three";

describe("threeSpace()", () => {
  it("returns adjusted position", () => {
    expect(threeSpace(0, 100)).toEqual(-50);
  });
});

describe("zZero()", () => {
  it("returns position", () => {
    const config = clone(INITIAL);
    expect(zZero(config)).toEqual(400);
  });
});

describe("zDir()", () => {
  it("returns factor", () => {
    const config = clone(INITIAL);
    config.negativeZ = true;
    expect(zDir(config)).toEqual(-1);
  });
});

describe("getColorFromBrightness()", () => {
  it("returns color", () => {
    expect(getColorFromBrightness(1)).toEqual("#444");
  });
});

describe("easyCubicBezierCurve3()", () => {
  it("returns coordinates", () => {
    const expected = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(90, 0, 0),
      new THREE.Vector3(100, 0, 0),
    );
    const result = easyCubicBezierCurve3(
      [0, 0, 0],
      [-10, 0, 0],
      [-10, 0, 0],
      [100, 0, 0],
    );
    expect(result).toEqual(expected);
  });
});

describe("mirror-aware position helpers", () => {
  const fakeConfig = () => {
    const config = clone(INITIAL);
    config.botSizeX = 1000;
    config.botSizeY = 500;
    config.bedLengthOuter = 1200;
    config.bedWidthOuter = 700;
    config.bedXOffset = 100;
    config.bedYOffset = 50;
    return config;
  };

  it("round trips garden coordinates without mirroring", () => {
    const config = fakeConfig();
    const get3DPosition = get3DPositionFunc(config);
    const getGardenPosition = getGardenPositionFunc(config, false);
    const world = get3DPosition({ x: 125, y: 250 });
    expect(getGardenPosition(world)).toEqual({ x: 125, y: 250 });
  });

  it("round trips garden coordinates with x and y mirroring", () => {
    const config = fakeConfig();
    config.mirrorX = true;
    config.mirrorY = true;
    const get3DPosition = get3DPositionFunc(config);
    const getGardenPosition = getGardenPositionFunc(config, false);
    const world = get3DPosition({ x: 125, y: 250 });
    expect(world).toEqual({ x: 375, y: 50 });
    expect(getGardenPosition(world)).toEqual({ x: 125, y: 250 });
  });

  it("returns world position with mirrored x and y", () => {
    const config = fakeConfig();
    config.columnLength = 200;
    config.zGantryOffset = 100;
    config.mirrorX = true;
    config.mirrorY = true;
    const getWorldPosition = getWorldPositionFunc(config);
    expect(getWorldPosition({ x: 125, y: 250, z: 10 })).toEqual([375, 50, 150]);
  });
});
