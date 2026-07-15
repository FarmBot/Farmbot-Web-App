import { Camera, VectorXyz } from "./zoom_beacons_constants";

export const STARGAZING_CAMERA_SESSION_KEY = "threeDStargazingCamera";

const parseVector = (value: unknown): VectorXyz | undefined =>
  Array.isArray(value)
    && value.length == 3
    && value.every(item => typeof item == "number" && Number.isFinite(item))
    ? [value[0], value[1], value[2]]
    : undefined;

export const parseStargazingCamera = (value: unknown): Camera | undefined => {
  if (!value || typeof value != "object") { return undefined; }
  const candidate = value as Partial<Camera>;
  const position = parseVector(candidate.position);
  const target = parseVector(candidate.target);
  return position && target ? { position, target } : undefined;
};

export const loadStargazingCamera = (): Camera | undefined => {
  try {
    const value = window.sessionStorage.getItem(STARGAZING_CAMERA_SESSION_KEY);
    return value ? parseStargazingCamera(JSON.parse(value)) : undefined;
  } catch {
    return undefined;
  }
};

export const saveStargazingCamera = (camera: Camera) => {
  try {
    window.sessionStorage.setItem(
      STARGAZING_CAMERA_SESSION_KEY,
      JSON.stringify(camera),
    );
  } catch {
    // Stargazing still works when session storage is unavailable.
  }
};

export const anchorStargazingOrbit = (
  camera: Camera,
  anchor: VectorXyz,
): Camera => {
  const offset: VectorXyz = [
    camera.target[0] - camera.position[0],
    camera.target[1] - camera.position[1],
    camera.target[2] - camera.position[2],
  ];
  return {
    position: [...anchor],
    target: [
      anchor[0] + offset[0],
      anchor[1] + offset[1],
      anchor[2] + offset[2],
    ],
  };
};
