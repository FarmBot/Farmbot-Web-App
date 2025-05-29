import { computeSurface, getZFunc, precomputeTriangles } from "../triangles";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";

describe("precomputeTriangles()", () => {
  it("computes triangles: zero", () => {
    expect(precomputeTriangles([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ], [0, 1, 2])).toEqual([]);
  });

  it("computes triangles", () => {
    expect(precomputeTriangles([
      [1, 1, 0],
      [4, 1, 0],
      [2, 3, 0],
    ], [0, 1, 2])).toEqual([{
      a: [1, 1, 0],
      b: [4, 1, 0],
      c: [2, 3, 0],
      det: 6,
      x1: 1,
      x2: 4,
      x3: 2,
      y1: 1,
      y2: 1,
      y3: 3,
    }]);
  });
});

describe("getZFunc()", () => {
  it("gets Z: falls back", () => {
    expect(getZFunc([], -100)(0, 0)).toEqual(-100);
  });

  it("gets Z", () => {
    expect(getZFunc([{
      a: [0, 0, 10],
      b: [2, 0, 20],
      c: [0, 2, 30],
      det: 4,
      x1: 0,
      x2: 2,
      x3: 0,
      y1: 0,
      y2: 0,
      y3: 2,
    }], -100)(1, 1)).toEqual(25);
  });
});

const zs = (items: [number, number, number][]) => items.map(i => i[2]);

describe("computeSurface()", () => {
  it("computes surface: above bed top", () => {
    const config = clone(INITIAL);
    config.soilHeight = 300;
    config.columnLength = 1000;
    config.bedHeight = 1;
    const { vertexList } = computeSurface([], config);
    expect(zs(vertexList)).toEqual([-900, -900, -900, -900, -300, -300]);
  });

  it("computes surface: below bed bottom", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.columnLength = 100;
    config.bedHeight = 100;
    const { vertexList } = computeSurface([], config);
    expect(zs(vertexList)).toEqual([-100, -100, -100, -100, -500, -500]);
  });

  it("computes surface: no soil points", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const { vertexList } = computeSurface(undefined, config);
    expect(zs(vertexList)).toEqual([-500, -500, -500, -500, -500, -500]);
  });

  it("computes surface: soil points", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const { vertexList } = computeSurface(soilPoints, config);
    expect(zs(vertexList)).toEqual([-600, 0, -500, -500, -500, -500]);
  });

  it("computes surface: exaggerated", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.exaggeratedZ = true;
    config.perspective = true;
    const { vertexList } = computeSurface(soilPoints, config);
    expect(zs(vertexList)).toEqual([-1500, 4500, -500, -500, -500, -500]);
  });
});
