import { error } from "../../toast/toast";
import { toPairs } from "../../util";
import { t } from "../../i18next_wrapper";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { runFarmware } from "../../devices/actions";

export const scanImage = (coordScale: number) => (imageId: number) =>
  coordScale
    ? runFarmware("historical-plant-detection",
      toPairs({ PLANT_DETECTION_selected_image: "" + imageId }))
    : error(t("Calibrate camera first"));

export const detectPlants = (coordScale: number) => () =>
  coordScale
    ? runFarmware(FarmwareName.PlantDetection)
    : error(t("Calibrate camera first"));
