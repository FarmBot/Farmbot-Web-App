import { round } from "lodash";
import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";

export interface CameraInitProps {
  topDown: boolean;
  viewpointHeading: number;
}

export const cameraInit = (props: CameraInitProps): Camera => {
  const { topDown, viewpointHeading } = props;
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
    || getDefaultCameraPosition(viewpointHeading);

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

export const getDefaultCameraPosition = (
  heading: number,
  topDown = false,
): [number, number, number] => {
  const radians = heading * Math.PI / 180;

  if (topDown) {
    const phase = Math.PI / 2;
    return [
      round(4000 * Math.SQRT2 * Math.cos(radians - phase)),
      round(2000 * Math.SQRT2 * Math.sin(radians - phase)),
      5000,
    ];
  }

  const phase = Math.PI / 4;
  return isDesktop()
    ? [
      round(2000 * Math.SQRT2 * Math.cos(radians - phase)),
      round(4000 * Math.SQRT2 * Math.sin(radians - phase)),
      2500,
    ]
    : [
      round(5400 * Math.SQRT2 * Math.cos(radians - phase)),
      round(2500 * Math.SQRT2 * Math.sin(radians - phase)),
      3400,
    ];
};
