import { getDevice } from "../../device";
import { toPairs } from "../../util";
import { commandErr } from "../../devices/actions";

export const calibrate = () =>
  getDevice()
    .execScript("camera-calibration")
    .catch(commandErr("Camera calibration"));

export const scanImage = (imageId: number) =>
  getDevice()
    .execScript("historical-camera-calibration",
      toPairs({ CAMERA_CALIBRATION_selected_image: "" + imageId }))
    .catch(commandErr("Camera calibration"));
