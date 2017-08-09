import { devices } from "../../device";

export function calibrate() {
  return function () {
    devices.current.execScript("camera-calibration");
  };
}

export function scanImage(imageId: number) {
  return function () {
    devices
      .current
      .execScript("historical-camera-calibration", [{
        kind: "pair", args: {
          label: "CAMERA_CALIBRATION_selected_image",
          value: "" + imageId
        }
      }]);
  };
}
