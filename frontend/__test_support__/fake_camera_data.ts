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
  layerOn: { value: true, reason: "show_images: true" },
  alwaysShow: { value: false, reason: "alwaysHighlightImage: false" },
  inRange: { value: true, reason: "no image" },
  notHidden: { value: true, reason: "\nhidden: []\nshown: []" },
  zMatch: { value: true, reason: "image z: undefined\ncalibration z: none" },
  sizeMatch: { value: true, reason: "image size: {}\ncalibration size: {}" },
  typeShown: {
    value: true, reason: "undefined: photo\nshowPhotoImages: true"
      + "\nshowCalibrationImages: true\nshowDetectionImages: true\n"
      + "showHeightImages: true"
  },
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
