import {
  getZFunc, parseStoredTriangles, precomputeTriangles, serializeTriangles,
} from "../triangle_functions";

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
      maxX: 4,
      maxY: 3,
      minX: 1,
      minY: 1,
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
      maxX: 2,
      maxY: 2,
      minX: 0,
      minY: 0,
      x1: 0,
      x2: 2,
      x3: 0,
      y1: 0,
      y2: 0,
      y3: 2,
    }], -100)(1, 1)).toEqual(25);
  });

  it("caches Z by coordinate and invalidates with a new function", () => {
    const triangle = {
      a: [0, 0, 10] as [number, number, number],
      b: [2, 0, 20] as [number, number, number],
      c: [0, 2, 30] as [number, number, number],
      det: 4,
      maxX: 2,
      maxY: 2,
      minX: 0,
      minY: 0,
      x1: 0,
      x2: 2,
      x3: 0,
      y1: 0,
      y2: 0,
      y3: 2,
    };
    const getZ = getZFunc([triangle], -100);
    expect(getZ(1, 1)).toEqual(25);
    triangle.c[2] = 300;
    expect(getZ(1, 1)).toEqual(25);
    expect(getZFunc([triangle], -100)(1, 1)).toEqual(160);
  });

  it("gets Z through the spatial index", () => {
    const triangles = precomputeTriangles([
      [0, 0, 10],
      [10, 0, 20],
      [0, 10, 30],
      [20, 0, 40],
      [30, 0, 50],
      [20, 10, 60],
      [0, 20, 70],
      [10, 20, 80],
      [0, 30, 90],
      [20, 20, 100],
      [30, 20, 110],
      [20, 30, 120],
    ], [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8,
      9, 10, 11,
    ]);
    expect(getZFunc(triangles, -100)(25, 25)).toEqual(115);
    expect(getZFunc(triangles, -100)(15, 15)).toEqual(-100);
  });

  it("keeps original triangle priority in indexed buckets", () => {
    const triangles = precomputeTriangles([
      [0, 0, 10],
      [10, 0, 10],
      [0, 10, 10],
      [0, 0, 20],
      [10, 0, 20],
      [0, 10, 20],
      [20, 0, 30],
      [30, 0, 30],
      [20, 10, 30],
      [0, 20, 40],
      [10, 20, 40],
      [0, 30, 40],
    ], [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8,
      9, 10, 11,
    ]);
    expect(getZFunc(triangles, -100)(1, 1)).toEqual(10);
  });
});

describe("stored triangles", () => {
  it("serializes compact triangles", () => {
    const triangles = precomputeTriangles([
      [0, 0, 10],
      [2, 0, 20],
      [0, 2, 30],
    ], [0, 1, 2]);
    expect(parseStoredTriangles(serializeTriangles(triangles)))
      .toEqual(triangles);
  });

  it("parses legacy triangle objects", () => {
    const triangles = precomputeTriangles([
      [0, 0, 10],
      [2, 0, 20],
      [0, 2, 30],
    ], [0, 1, 2]);
    expect(parseStoredTriangles(JSON.stringify(triangles)))
      .toEqual(triangles);
  });

  it("ignores invalid stored triangles", () => {
    expect(parseStoredTriangles("[\"foo\"]")).toEqual([]);
    expect(parseStoredTriangles("not json")).toEqual([]);
  });
});
