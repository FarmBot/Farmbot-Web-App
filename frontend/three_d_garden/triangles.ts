import Delaunator from "delaunator";
import { TaggedGenericPointer } from "farmbot";
import { Config } from "./config";
import { soilHeightPoint } from "../points/soil_height";

interface TriangleData {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  det: number;
}

export const precomputeTriangles = (
  vertices: [number, number, number][],
  faces: number[],
) => {
  const triangles: TriangleData[] = [];

  for (let i = 0; i < faces.length; i += 3) {
    const a = vertices[faces[i]];
    const b = vertices[faces[i + 1]];
    const c = vertices[faces[i + 2]];

    const [x1, y1] = [a[0], a[1]];
    const [x2, y2] = [b[0], b[1]];
    const [x3, y3] = [c[0], c[1]];

    const det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    if (Math.abs(det) < 1e-10) { continue; }
    triangles.push({ a, b, c, x1, y1, x2, y2, x3, y3, det });
  }

  return triangles;
};

export const getZFunc = (
  triangles: TriangleData[],
  fallback: number,
) =>
  (x: number, y: number) => {
    for (const t of triangles) {
      const { a, b, c, x1, y1, x2, y2, x3, y3, det } = t;
      const l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det;
      const l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det;
      const l3 = 1 - l1 - l2;

      if (l1 >= 0 && l2 >= 0 && l3 >= 0) {
        return l1 * a[2] + l2 * b[2] + l3 * c[2];
      }
    }
    return fallback;
  };

export const computeSurface = (
  mapPoints: TaggedGenericPointer[] | undefined,
  config: Config,
) => {
  const soilHeightPoints = (mapPoints || [])
    .filter(p => soilHeightPoint(p))
    .map(p => ([
      p.body.x,
      p.body.y,
      (config.exaggeratedZ && config.perspective)
        ? (-config.soilHeight + (p.body.z + config.soilHeight) * 10)
        : p.body.z,
    ]));

  [
    { x: 0, y: 0 },
    { x: 0, y: config.bedWidthOuter },
    { x: config.bedLengthOuter, y: 0 },
    { x: config.bedLengthOuter, y: config.bedWidthOuter },
  ].map(p => {
    soilHeightPoints.push([
      p.x - config.bedXOffset,
      p.y - config.bedYOffset,
      -config.soilHeight,
    ]);
  });

  const soilPoints = soilHeightPoints;

  const projected2D = soilPoints.map(([x, y, _z]) => [x, y]);
  const delaunay = Delaunator.from(projected2D);
  const triangles = delaunay.triangles;
  const vertices: number[] = [];
  const vertexList: [number, number, number][] = [];
  const faces: number[] = [];
  const uvs: number[] = [];
  const xs = soilPoints.map(p => p[0]);
  const ys = soilPoints.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = (maxX - minX) || 1;
  const height = (maxY - minY) || 1;
  for (let i = 0; i < triangles.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const index: number = triangles[i + j];
      faces.push(i + j);
      const [x, y, z] = soilPoints[index];
      vertices.push(x, y, z);
      vertexList.push([x, y, z]);
      const u = (x - minX) / width;
      const v = 1 - (y - minY) / height;
      uvs.push(u, v);
    }
  }
  return { vertices, vertexList, uvs, faces };
};
