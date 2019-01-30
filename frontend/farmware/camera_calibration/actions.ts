import { getDevice } from "../../device";
import { toPairs } from "../../util";
import { commandErr } from "../../devices/actions";

export function calibrate() {
  return function () {
    getDevice()
      .execScript("camera-calibration")
      .catch(commandErr("Camera calibration"));
  };
}

export function scanImage(imageId: number) {
  const p = toPairs({ "CAMERA_CALIBRATION_selected_image": ("" + imageId) });
  return function () {
    getDevice()
      .execScript("historical-camera-calibration", p)
      .catch(commandErr("Camera calibration"));
  };
}
