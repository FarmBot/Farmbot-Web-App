import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { CROPS } from "../frontend/crops/constants";
import {
  PLANT_ICON_ATLAS_CELL_HEIGHT,
  PLANT_ICON_ATLAS_CELL_WIDTH,
} from "../frontend/three_d_garden/garden/generated_plant_icon_atlas";

export interface PixelPoint {
  x: number;
  y: number;
}

export interface ConstellationVariation {
  cropSlug: string;
  points: readonly (readonly [number, number])[];
}

export interface BoundaryEdge {
  start: readonly [number, number];
  end: readonly [number, number];
}

const ROOT = process.cwd();
const OUTPUT_PATH = resolve(
  ROOT,
  "frontend/three_d_garden/garden/generated_constellations.bin",
);
const CATALOG_CROPS = Object.entries(CROPS).map(([cropSlug, crop]) => ({
  cropSlug,
  iconPath: resolve(ROOT, "public", crop.icon.replace(/^\//, "")),
}));
const IMAGE_SIZE = 64;
const CONTOUR_POINT_COUNT = 200;
const CONTOUR_TURN_THRESHOLD = 30;
const MAX_CONTOUR_SEGMENT_LENGTH = 10;
const MAX_CONTOUR_DEVIATION = 1;
const CONTOUR_SMOOTHING_PASSES = 3;
const ALPHA_THRESHOLD = 128;
const FORMAT_MAGIC = "FBCS";
const FORMAT_VERSION = 1;
const HEADER_BYTE_LENGTH = 11;
const MAX_SIGNED_BYTE = 127;
const MAX_UNSIGNED_BYTE = 255;

const pixelOffset = (x: number, y: number) =>
  (y * IMAGE_SIZE + x) * 4;

const inBounds = (x: number, y: number) =>
  x >= 0 && x < IMAGE_SIZE && y >= 0 && y < IMAGE_SIZE;

const alphaAt = (pixels: Buffer, x: number, y: number) =>
  inBounds(x, y) ? pixels[pixelOffset(x, y) + 3] : 0;

const isOpaque = (pixels: Buffer, x: number, y: number) =>
  alphaAt(pixels, x, y) >= ALPHA_THRESHOLD;

const distanceSquared = (a: PixelPoint, b: PixelPoint) =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

const readIconPixels = (iconPath: string) => {
  const pixels = execFileSync("magick", [
    iconPath,
    "-background",
    "none",
    "-gravity",
    "northwest",
    "-extent",
    `${PLANT_ICON_ATLAS_CELL_WIDTH}x${PLANT_ICON_ATLAS_CELL_HEIGHT}`,
    "-resize",
    `${IMAGE_SIZE}x${IMAGE_SIZE}!`,
    "-alpha",
    "on",
    "-depth",
    "8",
    "rgba:-",
  ]);
  return pixels;
};

const pointKey = (point: readonly [number, number]) =>
  `${point[0]},${point[1]}`;

const getBoundaryEdges = (pixels: Buffer) => {
  const edges: BoundaryEdge[] = [];
  for (let y = 0; y < IMAGE_SIZE; y++) {
    for (let x = 0; x < IMAGE_SIZE; x++) {
      if (!isOpaque(pixels, x, y)) { continue; }
      if (!isOpaque(pixels, x, y - 1)) {
        edges.push({ start: [x, y], end: [x + 1, y] });
      }
      if (!isOpaque(pixels, x + 1, y)) {
        edges.push({ start: [x + 1, y], end: [x + 1, y + 1] });
      }
      if (!isOpaque(pixels, x, y + 1)) {
        edges.push({ start: [x + 1, y + 1], end: [x, y + 1] });
      }
      if (!isOpaque(pixels, x - 1, y)) {
        edges.push({ start: [x, y + 1], end: [x, y] });
      }
    }
  }
  return edges;
};

export const getBoundaryLoopsFromEdges = (edges: BoundaryEdge[]) => {
  const edgesByStart = new Map<string, number[]>();
  edges.forEach((edge, index) => {
    const key = pointKey(edge.start);
    edgesByStart.set(key, [...(edgesByStart.get(key) || []), index]);
  });
  const unused = new Set(edges.map((_edge, index) => index));
  const loops: PixelPoint[][] = [];
  edges.forEach((_edge, firstIndex) => {
    if (!unused.has(firstIndex)) { return; }
    const loop: PixelPoint[] = [];
    const first = edges[firstIndex];
    let currentIndex = firstIndex;
    while (unused.has(currentIndex)) {
      const edge = edges[currentIndex];
      unused.delete(currentIndex);
      loop.push({ x: edge.start[0], y: edge.start[1] });
      if (pointKey(edge.end) == pointKey(first.start)) { break; }
      const next = edgesByStart.get(pointKey(edge.end))
        ?.find(index => unused.has(index));
      if (next == undefined) {
        throw new Error("Unable to close crop icon contour.");
      }
      currentIndex = next;
    }
    loops.push(loop);
  });
  return loops;
};

const getBoundaryLoops = (pixels: Buffer) =>
  getBoundaryLoopsFromEdges(getBoundaryEdges(pixels));

const closedContourLength = (points: PixelPoint[]) =>
  points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length];
    return total + Math.sqrt(distanceSquared(point, next));
  }, 0);

const resampleClosedContour = (points: PixelPoint[], count: number) => {
  const segmentLengths = points.map((point, index) =>
    Math.sqrt(distanceSquared(point, points[(index + 1) % points.length])));
  const totalLength = segmentLengths.reduce((total, length) =>
    total + length, 0);
  const sampled: PixelPoint[] = [];
  let segment = 0;
  let segmentStart = 0;
  for (let index = 0; index < count; index++) {
    const target = index * totalLength / count;
    while (segmentStart + segmentLengths[segment] < target) {
      segmentStart += segmentLengths[segment];
      segment++;
    }
    const start = points[segment];
    const end = points[(segment + 1) % points.length];
    const progress = (target - segmentStart) / segmentLengths[segment];
    sampled.push({
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    });
  }
  return sampled;
};

const smoothClosedContour = (points: PixelPoint[], passes: number) => {
  let smoothed = points;
  for (let pass = 0; pass < passes; pass++) {
    smoothed = smoothed.map((point, index) => {
      const previous = smoothed[
        (index - 1 + smoothed.length) % smoothed.length
      ];
      const next = smoothed[(index + 1) % smoothed.length];
      return {
        x: previous.x * 0.25 + point.x * 0.5 + next.x * 0.25,
        y: previous.y * 0.25 + point.y * 0.5 + next.y * 0.25,
      };
    });
  }
  return smoothed;
};

export const normalizePoints = (points: PixelPoint[]) => {
  return points.map(point => [
    Number((point.x / IMAGE_SIZE - 0.5).toFixed(4)),
    Number((0.5 - point.y / IMAGE_SIZE).toFixed(4)),
  ] as const);
};

const turnAngle = (
  previous: PixelPoint,
  current: PixelPoint,
  next: PixelPoint,
) => {
  const incoming = [current.x - previous.x, current.y - previous.y];
  const outgoing = [next.x - current.x, next.y - current.y];
  const denominator = Math.hypot(...incoming) * Math.hypot(...outgoing);
  const cosine = denominator == 0
    ? 1
    : (incoming[0] * outgoing[0] + incoming[1] * outgoing[1])
    / denominator;
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
};

export const distanceToSegment = (
  point: PixelPoint,
  start: PixelPoint,
  end: PixelPoint,
) => {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX ** 2 + segmentY ** 2;
  if (lengthSquared == 0) {
    return Math.sqrt(distanceSquared(point, start));
  }
  const projection = Math.max(0, Math.min(1,
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY)
    / lengthSquared));
  const projected = {
    x: start.x + projection * segmentX,
    y: start.y + projection * segmentY,
  };
  return Math.sqrt(distanceSquared(point, projected));
};

const maxContourDeviation = (
  points: PixelPoint[],
  startIndex: number,
  endIndex: number,
) => {
  let maxDeviation = 0;
  let index = (startIndex + 1) % points.length;
  while (index != endIndex) {
    maxDeviation = Math.max(
      maxDeviation,
      distanceToSegment(points[index], points[startIndex], points[endIndex]),
    );
    index = (index + 1) % points.length;
  }
  return maxDeviation;
};

export const simplifyClosedContour = (
  points: PixelPoint[],
  turnThreshold: number,
) => {
  const active = points.map((_point, index) => index);
  while (active.length > 3) {
    let removalIndex = -1;
    let smallestAngle = turnThreshold;
    active.forEach((pointIndex, index) => {
      const previousIndex = active[
        (index - 1 + active.length) % active.length
      ];
      const nextIndex = active[(index + 1) % active.length];
      const angle = turnAngle(
        points[previousIndex],
        points[pointIndex],
        points[nextIndex],
      );
      if (angle >= smallestAngle) { return; }
      const segmentLength = Math.sqrt(distanceSquared(
        points[previousIndex],
        points[nextIndex],
      ));
      if (segmentLength > MAX_CONTOUR_SEGMENT_LENGTH) { return; }
      const deviation = maxContourDeviation(
        points,
        previousIndex,
        nextIndex,
      );
      if (deviation > MAX_CONTOUR_DEVIATION) { return; }
      removalIndex = index;
      smallestAngle = angle;
    });
    if (removalIndex < 0) { break; }
    active.splice(removalIndex, 1);
  }
  return active.map(index => points[index]);
};

export const encodeConstellations = (
  variations: ConstellationVariation[],
) => {
  if (variations.length > 0xffff) {
    throw new Error("Constellation crop count exceeds Uint16 capacity.");
  }
  const encodedSlugs = variations.map(variation =>
    Buffer.from(variation.cropSlug, "utf8"));
  encodedSlugs.forEach(slug => {
    if (slug.length > MAX_UNSIGNED_BYTE) {
      throw new Error("Constellation crop slug exceeds Uint8 capacity.");
    }
  });
  variations.forEach(variation => {
    if (variation.points.length < 3
      || variation.points.length > MAX_UNSIGNED_BYTE) {
      throw new Error(
        `${variation.cropSlug} contour point count exceeds Uint8 capacity.`,
      );
    }
  });
  const coordinates = variations.flatMap(variation =>
    variation.points.flat());
  const maxCoordinate = Math.max(...coordinates.map(Math.abs));
  if (!Number.isFinite(maxCoordinate) || maxCoordinate == 0) {
    throw new Error("Constellation coordinates require a finite scale.");
  }
  const coordinateScale = maxCoordinate / MAX_SIGNED_BYTE;
  const byteLength = HEADER_BYTE_LENGTH
    + variations.reduce((total, variation, index) =>
      total + 2 + encodedSlugs[index].length
      + variation.points.length * 2, 0);
  const output = Buffer.allocUnsafe(byteLength);
  output.write(FORMAT_MAGIC, 0, "ascii");
  output.writeUInt8(FORMAT_VERSION, 4);
  output.writeUInt16LE(variations.length, 5);
  output.writeFloatLE(coordinateScale, 7);
  let offset = HEADER_BYTE_LENGTH;
  variations.forEach((variation, index) => {
    const slug = encodedSlugs[index];
    output.writeUInt8(slug.length, offset++);
    slug.copy(output, offset);
    offset += slug.length;
    output.writeUInt8(variation.points.length, offset++);
    variation.points.forEach(point => point.forEach(coordinate => {
      const encodedCoordinate = Math.round(coordinate / coordinateScale);
      output.writeInt8(encodedCoordinate, offset++);
    }));
  });
  return output;
};

export const generateConstellation = (outputPath = OUTPUT_PATH) => {
  const variations = CATALOG_CROPS.map(({ cropSlug, iconPath }) => {
    const pixels = readIconPixels(iconPath);
    const boundaryLoops = getBoundaryLoops(pixels);
    const boundary = boundaryLoops.sort((a, b) =>
      closedContourLength(b) - closedContourLength(a))[0];
    if (!boundary) { throw new Error(`No ${cropSlug} contour found.`); }
    const sampledContour = resampleClosedContour(
      boundary,
      CONTOUR_POINT_COUNT,
    );
    const smoothContour = smoothClosedContour(
      sampledContour,
      CONTOUR_SMOOTHING_PASSES,
    );
    const contourPoints = simplifyClosedContour(
      smoothContour,
      CONTOUR_TURN_THRESHOLD,
    );
    return {
      cropSlug,
      points: normalizePoints(contourPoints),
    };
  });
  writeFileSync(outputPath, encodeConstellations(variations));
};

if (import.meta.main) { generateConstellation(); }
