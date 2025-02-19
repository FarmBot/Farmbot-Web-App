import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";

export const cameraInit = (): Camera => {
  const devCameraString = DevSettings.get3dCamera();
  const devCamera = devCameraString ? JSON.parse(devCameraString) : undefined;
  const cameraPositionInit = devCamera?.position || [2000, -4000, 2500];
  const cameraTargetInit = devCamera?.target || [0, 0, 0];

  const initCamera: Camera = {
    position: isDesktop() ? cameraPositionInit : [5400, -2500, 3400],
    target: cameraTargetInit,
  };
  return initCamera;
};
