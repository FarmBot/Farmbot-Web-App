import { sendRPC } from "../devices/actions";

const runCameraOperation = (operation: string) =>
  sendRPC({ kind: "lua", args: { lua: `${operation}()` } });

export const calibrateCamera = () =>
  runCameraOperation("calibrate_camera");

export const detectWeeds = () =>
  runCameraOperation("detect_weeds");

export const measureSoilHeight = () =>
  runCameraOperation("measure_soil_height");
