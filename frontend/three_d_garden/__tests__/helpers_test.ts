import { clone } from "lodash";
import {
  easyCubicBezierCurve3,
  getColorFromBrightness,
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
