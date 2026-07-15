import {
  createCropConstellationCatalogResource,
  decodeCropConstellationCatalog,
} from "../constellation_data";

const HEADER_BYTE_LENGTH = 11;

const catalogBuffer = (
  slug = "crop",
  points = new Int8Array([0, 0, 10, 0, 0, 10]),
  trailingBytes = 0,
) => {
  const slugBytes = new TextEncoder().encode(slug);
  const pointCount = points.length / 2;
  const buffer = new ArrayBuffer(
    HEADER_BYTE_LENGTH + 2 + slugBytes.length + points.length + trailingBytes,
  );
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  bytes.set(new TextEncoder().encode("FBCS"), 0);
  view.setUint8(4, 1);
  view.setUint16(5, 1, true);
  view.setFloat32(7, 0.01, true);
  let offset = HEADER_BYTE_LENGTH;
  view.setUint8(offset++, slugBytes.length);
  bytes.set(slugBytes, offset);
  offset += slugBytes.length;
  view.setUint8(offset++, pointCount);
  bytes.set(new Uint8Array(points.buffer), offset);
  return buffer;
};

const thrownBy = (callback: () => unknown) => {
  try {
    callback();
  } catch (error) {
    return error;
  }
  throw new Error("Expected callback to throw.");
};

describe("decodeCropConstellationCatalog()", () => {
  it("decodes the binary catalog", () => {
    const catalog = decodeCropConstellationCatalog(catalogBuffer());
    expect(catalog.coordinateScale).toBeCloseTo(0.01);
    expect(catalog.totalPointCount).toEqual(3);
    expect(catalog.constellations).toHaveLength(1);
    expect(catalog.constellations[0].cropSlug).toEqual("crop");
    expect(catalog.constellations[0].pointCount).toEqual(3);
    expect([...catalog.constellations[0].points])
      .toEqual([0, 0, 10, 0, 0, 10]);
  });

  it("rejects invalid headers", () => {
    expect(() => decodeCropConstellationCatalog(new ArrayBuffer(0)))
      .toThrow("truncated");

    const signature = catalogBuffer();
    new Uint8Array(signature)[0] = 0;
    expect(() => decodeCropConstellationCatalog(signature))
      .toThrow("signature");

    const version = catalogBuffer();
    new DataView(version).setUint8(4, 2);
    expect(() => decodeCropConstellationCatalog(version))
      .toThrow("Unsupported");

    const empty = catalogBuffer();
    new DataView(empty).setUint16(5, 0, true);
    expect(() => decodeCropConstellationCatalog(empty)).toThrow("empty");

    [0, Number.NaN].forEach(scale => {
      const invalidScale = catalogBuffer();
      new DataView(invalidScale).setFloat32(7, scale, true);
      expect(() => decodeCropConstellationCatalog(invalidScale))
        .toThrow("coordinate scale");
    });
  });

  it("rejects invalid entries", () => {
    const missingEntry = catalogBuffer().slice(0, HEADER_BYTE_LENGTH);
    expect(() => decodeCropConstellationCatalog(missingEntry))
      .toThrow("truncated");

    const missingSlug = catalogBuffer().slice(0, HEADER_BYTE_LENGTH + 2);
    new DataView(missingSlug).setUint8(HEADER_BYTE_LENGTH, 10);
    expect(() => decodeCropConstellationCatalog(missingSlug))
      .toThrow("truncated");

    expect(() => decodeCropConstellationCatalog(
      catalogBuffer("crop", new Int8Array([0, 0, 1, 1])),
    )).toThrow("invalid contour");

    const missingPoints = catalogBuffer().slice(0, -1);
    expect(() => decodeCropConstellationCatalog(missingPoints))
      .toThrow("truncated");

    expect(() => decodeCropConstellationCatalog(catalogBuffer(
      "crop",
      new Int8Array([0, 0, 10, 0, 0, 10]),
      1,
    ))).toThrow("trailing bytes");
  });
});

describe("createCropConstellationCatalogResource()", () => {
  it("loads once and returns the decoded catalog", async () => {
    const fetchCatalog = jest.fn(() => Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(catalogBuffer()),
    })) as unknown as typeof fetch;
    const resource = createCropConstellationCatalogResource(
      "/constellations.bin",
      fetchCatalog,
    );
    const firstRead = thrownBy(resource.read) as Promise<unknown>;
    const secondRead = thrownBy(resource.read);

    expect(secondRead).toBe(firstRead);
    await firstRead;
    expect(resource.read().constellations[0].cropSlug).toEqual("crop");
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    expect(fetchCatalog).toHaveBeenCalledWith("/constellations.bin");
  });

  it("reports HTTP failures", async () => {
    const fetchCatalog = jest.fn(() => Promise.resolve({
      ok: false,
      status: 503,
    })) as unknown as typeof fetch;
    const resource = createCropConstellationCatalogResource(
      "/constellations.bin",
      fetchCatalog,
    );
    const load = thrownBy(resource.read) as Promise<unknown>;

    await expect(load).rejects.toThrow("503");
    expect(() => resource.read()).toThrow("503");
  });

  it("normalizes non-Error failures", async () => {
    const fetchCatalog = jest.fn(() => Promise.reject("offline")) as
      unknown as typeof fetch;
    const resource = createCropConstellationCatalogResource(
      "/constellations.bin",
      fetchCatalog,
    );
    const load = thrownBy(resource.read) as Promise<unknown>;

    await expect(load).rejects.toThrow("offline");
    expect(() => resource.read()).toThrow("offline");
  });
});
