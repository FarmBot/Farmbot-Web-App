import constellationDataUrl from "./generated_constellations.bin";

export interface CropConstellation {
  cropSlug: string;
  pointCount: number;
  points: Int8Array;
}

export interface CropConstellationCatalog {
  coordinateScale: number;
  constellations: CropConstellation[];
  totalPointCount: number;
}

const FORMAT_MAGIC = "FBCS";
const FORMAT_VERSION = 1;
const HEADER_BYTE_LENGTH = 11;

const requireBytes = (
  offset: number,
  byteLength: number,
  totalByteLength: number,
) => {
  if (offset + byteLength > totalByteLength) {
    throw new Error("Constellation data is truncated.");
  }
};

export const decodeCropConstellationCatalog = (
  buffer: ArrayBuffer,
): CropConstellationCatalog => {
  requireBytes(0, HEADER_BYTE_LENGTH, buffer.byteLength);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...bytes.subarray(0, 4));
  if (magic != FORMAT_MAGIC) {
    throw new Error("Invalid constellation data signature.");
  }
  if (view.getUint8(4) != FORMAT_VERSION) {
    throw new Error("Unsupported constellation data format.");
  }
  const constellationCount = view.getUint16(5, true);
  if (constellationCount == 0) {
    throw new Error("Constellation data is empty.");
  }
  const coordinateScale = view.getFloat32(7, true);
  if (!Number.isFinite(coordinateScale) || coordinateScale <= 0) {
    throw new Error("Invalid constellation coordinate scale.");
  }
  const constellations: CropConstellation[] = [];
  let totalPointCount = 0;
  let offset = HEADER_BYTE_LENGTH;
  for (let index = 0; index < constellationCount; index++) {
    requireBytes(offset, 1, buffer.byteLength);
    const slugByteLength = view.getUint8(offset++);
    requireBytes(offset, slugByteLength + 1, buffer.byteLength);
    const cropSlug = String.fromCharCode(
      ...bytes.subarray(offset, offset + slugByteLength),
    );
    offset += slugByteLength;
    const pointCount = view.getUint8(offset++);
    if (pointCount < 3) {
      throw new Error(`${cropSlug} has an invalid contour.`);
    }
    const pointByteLength = pointCount * 2;
    requireBytes(offset, pointByteLength, buffer.byteLength);
    const points = new Int8Array(buffer, offset, pointByteLength);
    offset += pointByteLength;
    totalPointCount += pointCount;
    constellations.push({ cropSlug, pointCount, points });
  }
  if (offset != buffer.byteLength) {
    throw new Error("Constellation data has trailing bytes.");
  }
  return { coordinateScale, constellations, totalPointCount };
};

export interface CropConstellationCatalogResource {
  read(): CropConstellationCatalog;
}

export const createCropConstellationCatalogResource = (
  url: string,
  fetchCatalog: typeof fetch,
): CropConstellationCatalogResource => {
  let catalog: CropConstellationCatalog | undefined;
  let catalogPromise: Promise<CropConstellationCatalog> | undefined;
  let catalogError: Error | undefined;

  const fetchAndDecode = (reload = false) => {
    const request = reload
      ? fetchCatalog(url, { cache: "reload" })
      : fetchCatalog(url);
    return request
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Unable to load constellation data: ${response.status}.`,
          );
        }
        return response.arrayBuffer();
      })
      .then(decodeCropConstellationCatalog);
  };

  const load = () => {
    catalogPromise ||= fetchAndDecode()
      .catch(error => error instanceof Error &&
        error.message == "Constellation data is truncated."
        ? fetchAndDecode(true)
        : Promise.reject(error))
      .then(decodedCatalog => catalog = decodedCatalog)
      .catch(error => {
        const loadError = error instanceof Error
          ? error
          : new Error(String(error));
        catalogError = loadError;
        throw loadError;
      });
    return catalogPromise;
  };

  return {
    read: () => {
      if (catalog) { return catalog; }
      if (catalogError != undefined) { throw catalogError; }
      // React Suspense recognizes a thrown pending promise as loading state.
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw load();
    },
  };
};

let constellationCatalogResource: CropConstellationCatalogResource | undefined;
let constellationCatalogFetch: typeof fetch | undefined;

export const readCropConstellationCatalog = () => {
  if (!constellationCatalogResource || constellationCatalogFetch != fetch) {
    constellationCatalogFetch = fetch;
    constellationCatalogResource = createCropConstellationCatalogResource(
      constellationDataUrl,
      constellationCatalogFetch,
    );
  }
  return constellationCatalogResource.read();
};
