import { toPairs } from "../../util";
import { runFarmware } from "../../devices/actions";
import { t } from "../../i18next_wrapper";

export const calibrate = (grid: boolean) => () =>
  runFarmware("camera-calibration",
    toPairs({
      CAMERA_CALIBRATION_easy_calibration: gridValue(grid),
    }), t("Camera calibration"));

export const scanImage = (grid: boolean) => (imageId: number) =>
  runFarmware("historical-camera-calibration",
    toPairs({
      CAMERA_CALIBRATION_selected_image: "" + imageId,
      CAMERA_CALIBRATION_easy_calibration: gridValue(grid),
    }), t("Camera calibration"));

const gridValue = (grid: boolean) => JSON.stringify(grid ? "TRUE" : "FALSE");
