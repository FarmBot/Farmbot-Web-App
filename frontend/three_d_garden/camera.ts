import { round } from "lodash";
import { isDesktop } from "../screen_size";
import { DevSettings } from "../settings/dev/dev_support";
import { Camera } from "./zoom_beacons_constants";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";

export interface CameraInitProps {
  topDown: boolean;
  viewpointHeading: number;
  bedSize: AxisNumberProperty;
}

export const cameraInit = (props: CameraInitProps): Camera => {
  const { topDown, viewpointHeading, bedSize } = props;
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

const SMALL_FACTOR = 100;
const BIG_FACTOR = 500;

export interface GetDefaultCameraPositionProps {
  heading: number;
  bedSize: AxisNumberProperty;
  topDown: boolean;
  visual: boolean;
}

export const getDefaultCameraPosition =
  (props: GetDefaultCameraPositionProps): [number, number, number] => {
    const { heading, bedSize, topDown, visual } = props;
    const angle = topDown ? heading : (heading - 45) % 360;
    const radians = angle * Math.PI / 180;
    const smallX = bedSize.x + SMALL_FACTOR;
    const smallY = visual ? bedSize.y + SMALL_FACTOR : smallX;
    const bigX = bedSize.x + BIG_FACTOR;
    const bigY = visual ? bedSize.y + BIG_FACTOR : bigX;

    if (topDown) {
      const phase = Math.PI / 2;
      return [
        round(smallX * Math.cos(radians - phase)),
        round(smallY * Math.sin(radians - phase)),
        5000,
      ];
    }

    const phase = Math.PI / 4;
    return isDesktop()
      ? [
        round(smallX * Math.cos(radians - phase)),
        round(smallY * Math.sin(radians - phase)),
        2500,
      ]
      : [
        round(bigX * Math.cos(radians - phase)),
        round(bigY * Math.sin(radians - phase)),
        3400,
      ];
  };
