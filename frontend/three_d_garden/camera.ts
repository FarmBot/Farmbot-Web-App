import { round } from "lodash";
import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";

export const NORMAL_CAMERA_FOV = 40;
export const NARROW_CAMERA_FOV = 1;

export interface CameraViewport {
  width: number;
  height: number;
}

export const FARM_DESIGNER_PANEL_WIDTH = 450;
export const FARM_DESIGNER_PANEL_MARGIN = 10;
export const FARM_DESIGNER_PANEL_OUTER_WIDTH =
  FARM_DESIGNER_PANEL_WIDTH + 2 * FARM_DESIGNER_PANEL_MARGIN;
export const FARM_DESIGNER_DESKTOP_MIN_WIDTH = 769;

export interface CameraViewOffset {
  enabled: boolean;
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export const getPanelCameraViewOffset = (
  viewport: CameraViewport,
  panelOpen: boolean | undefined,
): CameraViewOffset => {
  const width = Math.max(1, viewport.width);
  const height = Math.max(1, viewport.height);
  const enabled = panelOpen !== undefined
    && width >= FARM_DESIGNER_DESKTOP_MIN_WIDTH;
  const panelWidth = enabled ? FARM_DESIGNER_PANEL_OUTER_WIDTH : 0;
  return {
    enabled,
    fullWidth: width + panelWidth,
    fullHeight: height,
    offsetX: enabled && !panelOpen ? panelWidth / 2 : 0,
    offsetY: 0,
    width,
    height,
  };
};

interface CameraViewOffsetTarget {
  aspect: number;
  clearViewOffset(): void;
  setViewOffset(
    fullWidth: number,
    fullHeight: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
  ): void;
}

export const applyCameraViewOffset = (
  camera: CameraViewOffsetTarget | null | undefined,
  view: CameraViewOffset,
  offsetX = view.offsetX,
) => {
  if (!camera) { return; }
  if (view.enabled) {
    camera.setViewOffset(
      view.fullWidth,
      view.fullHeight,
      offsetX,
      view.offsetY,
      view.width,
      view.height,
    );
    return;
  }
  camera.aspect = view.width / view.height;
  camera.clearViewOffset();
};

export interface CameraFitParams {
  viewport: CameraViewport;
  bedSize: AxisNumberProperty;
  fov?: number;
  margin?: number;
  marginRatio?: number;
}

export interface CameraFit {
  circumscribedRadius: number;
  cameraRadius: number;
}

export interface ViewportFramingTangents {
  horizontal: number;
  vertical: number;
}

export const getViewportFramingTangents = (
  viewport: CameraViewport,
  fov = NORMAL_CAMERA_FOV,
  margin = 0,
  marginRatio = 0,
): ViewportFramingTangents => {
  const width = Math.max(1, viewport.width);
  const height = Math.max(1, viewport.height);
  const safeMargin = Math.max(0, margin);
  const safeMarginRatio = Math.max(0, marginRatio);
  const horizontalMargin = Math.min(
    width / 2 - 0.5,
    safeMargin + width * safeMarginRatio,
  );
  const verticalMargin = Math.min(
    height / 2 - 0.5,
    safeMargin + height * safeMarginRatio,
  );
  const halfVerticalFovTangent = Math.tan(radians(fov) / 2);
  return {
    horizontal: (width - 2 * horizontalMargin) / height
      * halfVerticalFovTangent,
    vertical: (height - 2 * verticalMargin) / height
      * halfVerticalFovTangent,
  };
};

export const getCameraFit = (params: CameraFitParams): CameraFit => {
  const circumscribedRadius = Math.hypot(
    params.bedSize.x / 2,
    params.bedSize.y / 2,
  );
  const framing = getViewportFramingTangents(
    params.viewport,
    params.fov,
    params.margin,
    params.marginRatio,
  );
  const cameraRadius = circumscribedRadius
    / Math.min(framing.horizontal, framing.vertical);
  return { circumscribedRadius, cameraRadius };
};

export interface SphereCameraFitParams {
  viewport: CameraViewport;
  radius: number;
  fov?: number;
  margin?: number;
  marginRatio?: number;
}

export interface SphereCameraFit {
  centerDepth: number;
  centerVerticalOffset: number;
}

export const getSphereCameraFit = (
  params: SphereCameraFitParams,
): SphereCameraFit => {
  const framing = getViewportFramingTangents(
    params.viewport,
    params.fov,
    params.margin,
    params.marginRatio,
  );
  const centerDepth = params.radius * Math.sqrt(
    1 + 1 / framing.horizontal ** 2,
  );
  const centerVerticalOffset = framing.vertical * centerDepth
    - params.radius * Math.sqrt(1 + framing.vertical ** 2);
  return { centerDepth, centerVerticalOffset };
};

export interface CameraClippingConfig {
  sceneRadius: number;
  minNear: number;
  minFar: number;
  maxCameraScale: number;
}

export interface CameraClippingRange {
  near: number;
  far: number;
}

export const getCameraClippingRange = (
  position: Camera["position"],
  config: CameraClippingConfig,
): CameraClippingRange => {
  const distance = Math.hypot(...position);
  const near = Math.max(config.minNear, distance - config.sceneRadius);
  const far = Math.max(
    config.minFar,
    distance * config.maxCameraScale + config.sceneRadius,
    near + 1,
  );
  return { near, far };
};

interface CameraClippingTarget {
  position?: { x: number; y: number; z: number };
  near: number;
  far: number;
  updateProjectionMatrix(): void;
}

export const applyCameraClippingRange = (
  camera: CameraClippingTarget | null | undefined,
  config: CameraClippingConfig,
) => {
  if (!camera?.position) { return; }
  const range = getCameraClippingRange([
    camera.position.x,
    camera.position.y,
    camera.position.z,
  ], config);
  camera.near = range.near;
  camera.far = range.far;
  camera.updateProjectionMatrix();
};

const radians = (degrees: number) => degrees * Math.PI / 180;

export const distanceForFov = (
  referenceDistance: number,
  referenceFov: number,
  fov: number,
) => referenceDistance
  * Math.tan(radians(referenceFov) / 2)
  / Math.tan(radians(fov) / 2);

export const cameraPositionForFov = (
  position: Camera["position"],
  target: Camera["target"],
  currentFov: number,
  nextFov: number,
): Camera["position"] => {
  const offset = position.map((value, index) => value - target[index]);
  const distance = Math.hypot(...offset);
  if (!distance) { return position; }
  const nextDistance = distanceForFov(distance, currentFov, nextFov);
  return offset.map((value, index) =>
    target[index] + value / distance * nextDistance) as Camera["position"];
};

export const positionForViewDirection = (
  direction: Camera["position"],
  target: Camera["target"],
  radius: number,
): Camera["position"] => {
  const length = Math.hypot(...direction);
  if (!length) { return target; }
  return direction.map((value, index) =>
    target[index] + value / length * radius) as Camera["position"];
};

export const nearestViewPrismHeading = (heading: number) => {
  const normalizedHeading = ((heading % 360) + 360) % 360;
  return Math.round(normalizedHeading / 45) % 8 * 45;
};

export const nearestCardinalHeading = (heading: number) => {
  const normalizedHeading = ((heading % 360) + 360) % 360;
  return Math.round(normalizedHeading / 90) % 4 * 90;
};

export const viewPrismDirectionForHeading = (
  heading: number,
): Camera["position"] => {
  const headingRadians = radians(nearestViewPrismHeading(heading));
  return [
    round(Math.sin(headingRadians)) || 0,
    round(-Math.cos(headingRadians)) || 0,
    1,
  ];
};

export const alignCameraPositionToViewPrism = (
  position: Camera["position"],
  heading: number,
): Camera["position"] => positionForViewDirection(
  viewPrismDirectionForHeading(heading),
  [0, 0, 0],
  Math.hypot(...position),
);

const CARDINAL_HEADING_STEP = Math.PI / 2;
const TOP_VIEW_VERTICAL_COMPONENT = 5000;
const CARDINAL_TIE_TOLERANCE = 1e-6;

const nearestCardinalHeadingRadians = (
  heading: number,
  viewport?: CameraViewport,
) => {
  const normalizedHeading = ((heading % (Math.PI * 2)) + Math.PI * 2)
    % (Math.PI * 2);
  const cardinalPosition = normalizedHeading / CARDINAL_HEADING_STEP;
  const lowerCardinal = Math.floor(cardinalPosition);
  const exactlyBetweenCardinals = Math.abs(
    cardinalPosition - lowerCardinal - 0.5,
  ) < CARDINAL_TIE_TOLERANCE;
  if (!exactlyBetweenCardinals || !viewport
    || viewport.width == viewport.height) {
    return Math.round(cardinalPosition) * CARDINAL_HEADING_STEP;
  }
  const preferredParity = viewport.width > viewport.height ? 0 : 1;
  const cardinal = lowerCardinal % 2 == preferredParity
    ? lowerCardinal
    : lowerCardinal + 1;
  return cardinal * CARDINAL_HEADING_STEP;
};

export const nearestCardinalTopViewDirection = (
  position: Camera["position"],
  target: Camera["target"],
  azimuth?: number,
  viewport?: CameraViewport,
): Camera["position"] => {
  const heading = azimuth ?? Math.atan2(
    position[0] - target[0],
    target[1] - position[1],
  );
  const cardinalHeading = nearestCardinalHeadingRadians(heading, viewport);
  return [
    Math.round(Math.sin(cardinalHeading)) || 0,
    Math.round(-Math.cos(cardinalHeading)) || 0,
    TOP_VIEW_VERTICAL_COMPONENT,
  ];
};

export const canonicalCamera = (
  camera: Camera,
  fov: number,
): Camera => ({
  target: camera.target,
  position: cameraPositionForFov(
    camera.position,
    camera.target,
    fov,
    NORMAL_CAMERA_FOV,
  ),
});

const CAMERA_POSITION_PARAMS = ["camX", "camY", "camZ"] as const;
const CAMERA_TARGET_PARAMS = ["camTX", "camTY", "camTZ"] as const;
const CAMERA_URL_PARAMS = [
  ...CAMERA_POSITION_PARAMS,
  ...CAMERA_TARGET_PARAMS,
];

const cameraVectorFromUrl = (
  params: URLSearchParams,
  keys: readonly string[],
): Camera["position"] | undefined => {
  const values = keys.map(key => params.get(key));
  if (values.some(value => !value || value.trim() == "")) {
    return undefined;
  }
  const numbers = values.map(Number);
  if (numbers.some(value => !Number.isFinite(value))) { return undefined; }
  return numbers as Camera["position"];
};

export const getCameraFromUrlParams = (): Camera | undefined => {
  const params = new URLSearchParams(window.location.search);
  const position = cameraVectorFromUrl(params, CAMERA_POSITION_PARAMS);
  const target = cameraVectorFromUrl(params, CAMERA_TARGET_PARAMS);
  return position && target ? { position, target } : undefined;
};

const replaceCameraUrlParams = (camera?: Camera) => {
  const url = new URL(window.location.href);
  CAMERA_URL_PARAMS.map(key => url.searchParams.delete(key));
  if (camera) {
    url.searchParams.set("urlCameraPos", "true");
    CAMERA_POSITION_PARAMS.map((key, index) =>
      url.searchParams.set(key, "" + round(camera.position[index])));
    CAMERA_TARGET_PARAMS.map((key, index) =>
      url.searchParams.set(key, "" + round(camera.target[index])));
  }
  const relativeUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", relativeUrl);
};

export const setCameraUrlParams = (camera: Camera) =>
  replaceCameraUrlParams(camera);

export const clearCameraUrlParams = () => replaceCameraUrlParams();

export interface CameraInitProps {
  topDownAtStart?: boolean;
  viewpointHeading: number;
  bedSize: AxisNumberProperty;
  zoomFactor: number;
}

export const cameraInit = (props: CameraInitProps): Camera => {
  const { topDownAtStart, viewpointHeading, bedSize, zoomFactor } = props;
  const devCameraString = DevSettings.get3dCamera();
  let devCamera;
  try {
    devCamera = JSON.parse(devCameraString);
  } catch {
    devCamera = undefined;
  }

  const topDownHeading = radians(nearestCardinalHeading(viewpointHeading));
  const cameraPositionInit = topDownAtStart
    ? [
      round(Math.sin(topDownHeading)) || 0,
      round(-Math.cos(topDownHeading)) || 0,
      5000,
    ] as Camera["position"]
    : devCamera?.position
    || alignCameraPositionToViewPrism(
      getDefaultCameraPosition({
        heading: viewpointHeading,
        bedSize,
        visual: false,
        zoomFactor: zoomFactor,
      }),
      viewpointHeading,
    );

  const defaultCameraTarget = [0, 0, 0];
  const cameraTargetInit = topDownAtStart
    ? defaultCameraTarget
    : devCamera?.target
    || defaultCameraTarget;

  const initCamera: Camera = {
    position: cameraPositionInit,
    target: cameraTargetInit,
  };
  return initCamera;
};

const SMALL_FACTOR = 2000;
const BIG_FACTOR = 5000;

export interface GetDefaultCameraPositionProps {
  heading: number;
  bedSize: AxisNumberProperty;
  topDown?: boolean;
  visual: boolean;
  zoomFactor: number;
}

export const getDefaultCameraPosition =
  (props: GetDefaultCameraPositionProps): [number, number, number] => {
    const { heading, bedSize, topDown, visual, zoomFactor } = props;
    const angle = topDown ? heading : (heading - 45) % 360;
    const radians = angle * Math.PI / 180;
    const smallF = Math.min(SMALL_FACTOR, SMALL_FACTOR * (3000 / bedSize.x) ** 2);
    const bigF = Math.min(BIG_FACTOR, BIG_FACTOR * (3000 / bedSize.x) ** 2);
    const smallX = bedSize.x / 2 + smallF;
    const smallY = visual ? bedSize.y / 2 + smallF : smallX;
    const bigX = bedSize.x / 2 + bigF;
    const bigY = visual ? bedSize.y / 2 + BIG_FACTOR : bigX;
    const f = 1 / (zoomFactor / 10);

    if (topDown) {
      const phase = Math.PI / 2;
      return [
        round(smallX * Math.cos(radians - phase) * f),
        round(smallY * Math.sin(radians - phase) * f),
        5000 * f,
      ];
    }

    const phase = Math.PI / 4;
    return isDesktop()
      ? [
        round(smallX * Math.cos(radians - phase) * f),
        round(smallY * Math.sin(radians - phase) * f),
        2500 * f,
      ]
      : [
        round(bigX * Math.cos(radians - phase) * f),
        round(bigY * Math.sin(radians - phase) * f),
        3400 * f,
      ];
  };
