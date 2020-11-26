import { error } from "../../toast/toast";
import { toPairs } from "../../util";
import { getDevice } from "../../device";
import { t } from "../../i18next_wrapper";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";

export const scanImage = (coordScale: number) => (imageId: number) =>
  coordScale
    ? getDevice()
      .execScript("historical-plant-detection",
        toPairs({ PLANT_DETECTION_selected_image: "" + imageId }))
      .catch(() => { })
    : error(t("Calibrate camera first"));

export const detectPlants = (coordScale: number) => () =>
  coordScale
    ? getDevice().execScript(FarmwareName.PlantDetection).catch(() => { })
    : error(t("Calibrate camera first"));
