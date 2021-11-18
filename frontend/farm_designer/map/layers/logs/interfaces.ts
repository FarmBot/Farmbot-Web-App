import { TaggedLog } from "farmbot";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import { BotPosition } from "../../../../devices/interfaces";
import { CameraCalibrationData } from "../../../interfaces";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";

export enum RenderedLog {
  imageCapture = "imageCapture",
  imageCalibrate = "imageCalibrate",
  imageDetect = "imageDetect",
  imageMeasure = "imageMeasure",
  findHome = "findHome",
}

export enum AnimationClass {
  capture = "capture",
  scan = "scan",
  find = "find",
}

export interface LogsLayerProps {
  visible: boolean;
  logs: TaggedLog[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  getConfigValue: GetWebAppConfigValue;
  deviceTarget: string;
  botPosition: BotPosition;
  plantAreaOffset: AxisNumberProperty;
}

export interface LogVisualProps {
  log: TaggedLog;
  visual: RenderedLog;
  cameraCalibrationData: CameraCalibrationData;
  cropImage: boolean;
  animate: boolean;
  mapTransformProps: MapTransformProps;
  deviceTarget: string;
  botPosition: BotPosition;
  plantAreaOffset: AxisNumberProperty;
}
