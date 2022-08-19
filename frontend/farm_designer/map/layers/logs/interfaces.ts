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
  findHomeAll = "findHomeAll",
  findHomeX = "findHomeX",
  findHomeY = "findHomeY",
  findHomeZ = "findHomeZ",
  findLengthAll = "findLengthAll",
  findLengthX = "findLengthX",
  findLengthY = "findLengthY",
  findLengthZ = "findLengthZ",
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
  showUncroppedArea: boolean;
  animate: boolean;
  mapTransformProps: MapTransformProps;
  deviceTarget: string;
  botPosition: BotPosition;
  plantAreaOffset: AxisNumberProperty;
}
