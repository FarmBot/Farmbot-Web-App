import { CROPS } from "../frontend/crops/constants";
import {
  decodeCropConstellationCatalog,
} from "../frontend/three_d_garden/garden/constellation_data";
import {
  distanceToSegment,
  encodeConstellations,
  generateConstellation,
  getBoundaryLoopsFromEdges,
  normalizePoints,
  simplifyClosedContour,
} from "./generate_constellation";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("normalizePoints()", () => {
  it("preserves positions in the fixed atlas cell", () => {
    expect(normalizePoints([
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      { x: 16, y: 48 },
    ])).toEqual([
      [-0.5, 0.5],
      [0.5, -0.5],
      [-0.25, -0.25],
    ]);
  });
});

describe("simplifyClosedContour()", () => {
  it("removes redundant straight-line points without losing corners", () => {
    expect(simplifyClosedContour([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ], 30)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ]);
  });

  it("handles a zero-length candidate segment", () => {
    const simplified = simplifyClosedContour([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ], 200);
    expect(simplified.length).toBeGreaterThanOrEqual(3);
  });
});

describe("distanceToSegment()", () => {
  it("measures from a point to a zero-length segment", () => {
    expect(distanceToSegment(
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    )).toEqual(1);
  });
});

describe("getBoundaryLoopsFromEdges()", () => {
  it("rejects a boundary that cannot be closed", () => {
    expect(() => getBoundaryLoopsFromEdges([{
      start: [0, 0],
      end: [1, 0],
    }])).toThrow("Unable to close");
  });
});

describe("encodeConstellations()", () => {
  it("round-trips the compact catalog format", () => {
    const encoded = encodeConstellations([
      {
        cropSlug: "first-crop",
        points: [[-0.5, 0.5], [0.5, 0.5], [0, -0.5]],
      },
      {
        cropSlug: "second-crop",
        points: [[-0.25, 0.25], [0.25, 0.25], [0, -0.25]],
      },
    ]);
    const decoded = decodeCropConstellationCatalog(
      encoded.buffer.slice(
        encoded.byteOffset,
        encoded.byteOffset + encoded.byteLength,
      ) as ArrayBuffer,
    );

    expect(decoded.constellations.map(({ cropSlug, pointCount }) => ({
      cropSlug,
      pointCount,
    }))).toEqual([
      { cropSlug: "first-crop", pointCount: 3 },
      { cropSlug: "second-crop", pointCount: 3 },
    ]);
    expect(decoded.totalPointCount).toEqual(6);
    expect(decoded.coordinateScale).toBeCloseTo(0.5 / 127);
  });

  it("rejects values that cannot be represented by the format", () => {
    expect(() => encodeConstellations(Array(0x10000).fill({
      cropSlug: "crop",
      points: [[0, 0], [1, 0], [0, 1]],
    }))).toThrow("crop count");
    expect(() => encodeConstellations([{
      cropSlug: "x".repeat(256),
      points: [[0, 0], [1, 0], [0, 1]],
    }])).toThrow("slug");
    expect(() => encodeConstellations([{
      cropSlug: "crop",
      points: [[0, 0], [1, 0]],
    }])).toThrow("point count");
    expect(() => encodeConstellations([{
      cropSlug: "crop",
      points: [[0, 0], [0, 0], [0, 0]],
    }])).toThrow("finite scale");
  });
});

describe("generated_constellations.bin", () => {
  it("generates a decodable contour for every catalog crop", () => {
    const directory = mkdtempSync(join(tmpdir(), "constellations-test-"));
    const outputPath = join(directory, "constellations.bin");
    try {
      generateConstellation(outputPath);
      const output = readFileSync(outputPath);
      const buffer = output.buffer.slice(
        output.byteOffset,
        output.byteOffset + output.byteLength,
      ) as ArrayBuffer;
      const catalog = decodeCropConstellationCatalog(buffer);
      expect(catalog.constellations.map(({ cropSlug }) => cropSlug))
        .toEqual(Object.keys(CROPS));
    } finally {
      rmSync(directory, { recursive: true });
    }
  }, 30_000);

  it("contains one valid contour for every catalog crop", async () => {
    const file = Bun.file(
      "frontend/three_d_garden/garden/generated_constellations.bin",
    );
    const catalog = decodeCropConstellationCatalog(await file.arrayBuffer());
    expect(catalog.constellations.map(constellation => constellation.cropSlug))
      .toEqual(Object.keys(CROPS));
    expect(catalog.constellations.every(constellation =>
      constellation.pointCount >= 3)).toEqual(true);
  });
});
