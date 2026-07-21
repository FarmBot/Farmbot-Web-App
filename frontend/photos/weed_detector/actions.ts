import { error } from "../../toast/toast";
import { toPairs } from "../../util";
import { t } from "../../i18next_wrapper";
import { runFarmware } from "../../devices/actions";
import { forceOnline } from "../../devices/must_be_online";
import { detectWeeds } from "../actions";

export const scanImage = (coordScale: number) => (imageId: number) =>
  coordScale
    ? runFarmware("historical-plant-detection",
      toPairs({ PLANT_DETECTION_selected_image: "" + imageId }))
    : error(t("Calibrate camera first"));

export const detectPlants = (coordScale: number) => () =>
  coordScale || forceOnline()
    ? detectWeeds()
    : error(t("Calibrate camera first"));
