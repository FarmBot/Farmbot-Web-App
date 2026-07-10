import { round } from "lodash";
import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";

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
  window.history.replaceState(window.history.state, "", url.toString());
};

export const setCameraUrlParams = (camera: Camera) =>
  replaceCameraUrlParams(camera);

export const clearCameraUrlParams = () => replaceCameraUrlParams();

export interface CameraInitProps {
  topDown: boolean;
  viewpointHeading: number;
  bedSize: AxisNumberProperty;
  zoomFactor: number;
}

export const cameraInit = (props: CameraInitProps): Camera => {
  const { topDown, viewpointHeading, bedSize, zoomFactor } = props;
  const devCameraString = DevSettings.get3dCamera();
  let devCamera;
  try {
    devCamera = JSON.parse(devCameraString);
  } catch {
    devCamera = undefined;
  }

  const topDownCameraPosition = topDown ? [0, 0, 5000] : undefined;
  const cameraPositionInit = topDownCameraPosition
    || devCamera?.position
    || getDefaultCameraPosition({
      heading: viewpointHeading,
      bedSize,
      topDown: false,
      visual: false,
      zoomFactor: zoomFactor,
    });

  const defaultCameraTarget = [0, 0, 0];
  const topDownCameraTarget = topDown ? [0, 0, 0] : undefined;
  const cameraTargetInit = topDownCameraTarget
    || devCamera?.target
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
  topDown: boolean;
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
