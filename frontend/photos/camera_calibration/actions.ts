import { toPairs } from "../../util";
import { runFarmware } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { calibrateCamera } from "../actions";

export const calibrate = (_grid: boolean) => () => calibrateCamera();

export const scanImage = (grid: boolean) => (imageId: number) =>
  runFarmware("historical-camera-calibration",
    toPairs({
      CAMERA_CALIBRATION_selected_image: "" + imageId,
      CAMERA_CALIBRATION_easy_calibration: gridValue(grid),
    }), t("Camera calibration"));

const gridValue = (grid: boolean) => JSON.stringify(grid ? "TRUE" : "FALSE");
