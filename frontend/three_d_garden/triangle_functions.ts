import { perfEnabled, perfSample } from "../performance/perf";

export interface TriangleData {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  det: number;
}

interface TriangleIndex {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  buckets: TriangleData[][];
}

const MAX_BUCKETS_PER_AXIS = 64;
const MIN_INDEXED_TRIANGLES = 4;

const triangleData = (
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
) => {
  const [x1, y1] = [a[0], a[1]];
  const [x2, y2] = [b[0], b[1]];
  const [x3, y3] = [c[0], c[1]];
  const det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  if (Math.abs(det) < 1e-10) { return undefined; }
  return {
    a,
    b,
    c,
    minX: Math.min(x1, x2, x3),
    maxX: Math.max(x1, x2, x3),
    minY: Math.min(y1, y2, y3),
    maxY: Math.max(y1, y2, y3),
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    det,
  };
};

export const precomputeTriangles = (
  vertices: [number, number, number][],
  faces: number[],
) => {
  const triangles: TriangleData[] = [];

  for (let i = 0; i < faces.length; i += 3) {
    const a = vertices[faces[i]];
    const b = vertices[faces[i + 1]];
    const c = vertices[faces[i + 2]];
    const triangle = triangleData(a, b, c);
    triangle && triangles.push(triangle);
  }

  return triangles;
};

export const serializeTriangles = (triangles: TriangleData[]) =>
  JSON.stringify(triangles.map(({ a, b, c }) => [
    a[0], a[1], a[2],
    b[0], b[1], b[2],
    c[0], c[1], c[2],
  ]));

const pointFromArray = (
  values: unknown[],
  offset: number,
): [number, number, number] | undefined => {
  const point = values.slice(offset, offset + 3);
  if (point.length != 3 || !point.every(Number.isFinite)) {
    return undefined;
  }
  return point as [number, number, number];
};

const parseStoredTriangle = (value: unknown): TriangleData | undefined => {
  if (Array.isArray(value)) {
    const a = pointFromArray(value, 0);
    const b = pointFromArray(value, 3);
    const c = pointFromArray(value, 6);
    return a && b && c ? triangleData(a, b, c) : undefined;
  }
  if (!value || typeof value != "object") { return undefined; }
  const { a, b, c } = value as Partial<TriangleData>;
  return Array.isArray(a) && Array.isArray(b) && Array.isArray(c)
    ? triangleData(a, b, c)
    : undefined;
};

export const parseStoredTriangles = (storedTriangles: string | null) => {
  try {
    const parsed = JSON.parse(storedTriangles || "[]") as unknown;
    if (!Array.isArray(parsed)) { return []; }
    return parsed
      .map(parseStoredTriangle)
      .filter((triangle): triangle is TriangleData => !!triangle);
  } catch {
    return [];
  }
};

const clampCell = (value: number, min: number, size: number, count: number) =>
  Math.min(count - 1, Math.max(0, Math.floor((value - min) / size)));

const bucketIndex = (index: TriangleIndex, column: number, row: number) =>
  row * index.columns + column;

const buildTriangleIndex = (triangles: TriangleData[]) => {
  if (triangles.length < MIN_INDEXED_TRIANGLES) { return undefined; }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const triangle of triangles) {
    minX = Math.min(minX, triangle.minX);
    maxX = Math.max(maxX, triangle.maxX);
    minY = Math.min(minY, triangle.minY);
    maxY = Math.max(maxY, triangle.maxY);
  }
  if (minX == maxX || minY == maxY) { return undefined; }
  const bucketCount = Math.min(
    MAX_BUCKETS_PER_AXIS,
    Math.max(1, Math.ceil(Math.sqrt(triangles.length))),
  );
  const index: TriangleIndex = {
    minX,
    maxX,
    minY,
    maxY,
    columns: bucketCount,
    rows: bucketCount,
    cellWidth: (maxX - minX) / bucketCount,
    cellHeight: (maxY - minY) / bucketCount,
    buckets: Array.from({ length: bucketCount * bucketCount }, () => []),
  };
  for (const triangle of triangles) {
    const minColumn = clampCell(triangle.minX, minX, index.cellWidth,
      index.columns);
    const maxColumn = clampCell(triangle.maxX, minX, index.cellWidth,
      index.columns);
    const minRow = clampCell(triangle.minY, minY, index.cellHeight,
      index.rows);
    const maxRow = clampCell(triangle.maxY, minY, index.cellHeight,
      index.rows);
    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        index.buckets[bucketIndex(index, column, row)].push(triangle);
      }
    }
  }
  return index;
};

const indexedTrianglesForPoint = (
  index: TriangleIndex | undefined,
  triangles: TriangleData[],
  x: number,
  y: number,
) => {
  if (!index) { return triangles; }
  if (
    x < index.minX || x > index.maxX ||
    y < index.minY || y > index.maxY
  ) {
    return [];
  }
  const column = clampCell(x, index.minX, index.cellWidth, index.columns);
  const row = clampCell(y, index.minY, index.cellHeight, index.rows);
  return index.buckets[bucketIndex(index, column, row)];
};

export const getZFunc = (
  triangles: TriangleData[],
  fallback: number,
) => {
  const cache: Record<string, number> = {};
  const measure = perfEnabled();
  const indexStartedAt = measure ? performance.now() : 0;
  const index = buildTriangleIndex(triangles);
  measure && perfSample("getZIndexMs", performance.now() - indexStartedAt);
  return (x: number, y: number) => {
    const key = `${x},${y}`;
    const cached = cache[key];
    if (cached !== undefined) { return cached; }
    const startedAt = measure ? performance.now() : 0;
    for (const t of indexedTrianglesForPoint(index, triangles, x, y)) {
      const { a, b, c, x1, y1, x2, y2, x3, y3, det } = t;
      const l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det;
      const l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det;
      const l3 = 1 - l1 - l2;

      if (l1 >= 0 && l2 >= 0 && l3 >= 0) {
        cache[key] = l1 * a[2] + l2 * b[2] + l3 * c[2];
        measure && perfSample("getZMs", performance.now() - startedAt);
        return cache[key];
      }
    }
    cache[key] = fallback;
    measure && perfSample("getZMs", performance.now() - startedAt);
    return cache[key];
  };
};
