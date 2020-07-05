import { error } from "../../toast/toast";
import { toPairs } from "../../util";
import { getDevice } from "../../device";
import { t } from "../../i18next_wrapper";

export const scanImage = (coordScale: number) => (imageId: number) =>
  coordScale
    ? getDevice()
      .execScript("historical-plant-detection",
        toPairs({ PLANT_DETECTION_selected_image: "" + imageId }))
      .catch(() => { })
    : error(t("Calibrate camera first"));

export const detectPlants = (coordScale: number) => () =>
  coordScale
    ? getDevice().execScript("plant-detection").catch(() => { })
    : error(t("Calibrate camera first"));
