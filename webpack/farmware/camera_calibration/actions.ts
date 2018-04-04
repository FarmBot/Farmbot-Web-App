import { getDevice } from "../../device";

export function calibrate() {
  return function () {
    getDevice().execScript("camera-calibration").catch(() => { });
  };
}

export function scanImage(imageId: number) {
  return function () {
    const p = getDevice().execScript("historical-camera-calibration", [{
      kind: "pair", args: {
        label: "CAMERA_CALIBRATION_selected_image",
        value: "" + imageId
      }
    }]);
    p && p.catch(() => { });
  };
}
