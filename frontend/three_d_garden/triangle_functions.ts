export interface TriangleData {
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
) => {
  const cache: Record<string, number> = {};
  return (x: number, y: number) => {
    const key = `${x},${y}`;
    const cached = cache[key];
    if (cached !== undefined) { return cached; }
    for (const t of triangles) {
      const { a, b, c, x1, y1, x2, y2, x3, y3, det } = t;
      const l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / det;
      const l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / det;
      const l3 = 1 - l1 - l2;

      if (l1 >= 0 && l2 >= 0 && l3 >= 0) {
        cache[key] = l1 * a[2] + l2 * b[2] + l3 * c[2];
        return cache[key];
      }
    }
    cache[key] = fallback;
    return cache[key];
  };
};
