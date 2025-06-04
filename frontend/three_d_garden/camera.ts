import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";

export const cameraInit = (topDown: boolean): Camera => {
  const devCameraString = DevSettings.get3dCamera();
  const devCamera = devCameraString ? JSON.parse(devCameraString) : undefined;

  const defaultCameraPosition = isDesktop()
    ? [2000, -4000, 2500]
    : [5400, -2500, 3400];
  const topDownCameraPosition = topDown ? [0, 0, 5000] : undefined;
  const cameraPositionInit = topDownCameraPosition
    || devCamera?.position
    || defaultCameraPosition;

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
