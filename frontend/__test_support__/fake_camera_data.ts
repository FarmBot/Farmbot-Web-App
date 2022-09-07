import { CameraCalibrationData } from "../farm_designer/interfaces";
import { ImageShowFlags } from "../photos/images/interfaces";
import { PhotosPanelState } from "../photos/interfaces";

export const fakeCameraCalibrationData = (): CameraCalibrationData => ({
  offset: { x: undefined, y: undefined },
  center: { x: undefined, y: undefined },
  origin: undefined,
  rotation: undefined,
  scale: undefined,
  calibrationZ: undefined
});

export const fakeCameraCalibrationDataFull = (): CameraCalibrationData => ({
  offset: { x: "50", y: "75" },
  center: { x: "320", y: "240" },
  origin: "\"TOP_RIGHT\"",
  rotation: "-57.45",
  scale: "0.8041",
  calibrationZ: "0",
});

export const fakeImageShowFlags = (): ImageShowFlags => ({
  layerOn: true,
  inRange: true,
  notHidden: true,
  zMatch: true,
  sizeMatch: true,
  typeShown: true,
});

export const fakePhotosPanelState = (): PhotosPanelState => ({
  filter: false,
  camera: false,
  calibration: false,
  detection: false,
  measure: false,
  manage: false,
  calibrationPP: false,
  detectionPP: false,
});
