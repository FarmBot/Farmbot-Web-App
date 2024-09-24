import moment from "moment";
import { Everything } from "../interfaces";
import { EditPlantInfoProps } from "../farm_designer/interfaces";
import {
  maybeFindPlantById, maybeFindPlantTemplateById, maybeGetTimeSettings,
  selectAllCurves,
  selectAllFarmwareEnvs,
  selectAllGenericPointers,
  selectAllPlantPointers,
} from "../resources/selectors";
import { PlantStage, TaggedPoint } from "farmbot";
import { TaggedPlant } from "../farm_designer/map/interfaces";
import { isNumber, get } from "lodash";
import { getWebAppConfigValue } from "../config_storage/actions";
import { soilHeightPoint } from "../points/soil_height";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { validBotLocationData } from "../util/location";
import { botSize } from "../farm_designer/state_to_props";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { validFbosConfig } from "../util";
import { PlantPointer, PlantTemplate } from "farmbot/dist/resources/api_resources";

export function mapStateToProps(props: Everything): EditPlantInfoProps {
  const openedSavedGarden =
    props.resources.consumers.farm_designer.openedSavedGarden;
  const gardenOpen = !!openedSavedGarden;
  const findPlant = (id: string | undefined) => {
    const num = parseInt(id || "NOPE", 10);
    if (isNumber(num) && !isNaN(num)) {
      return gardenOpen
        ? maybeFindPlantTemplateById(props.resources.index, num)
        : maybeFindPlantById(props.resources.index, num);
    }
  };

  const soilHeightPoints = selectAllGenericPointers(props.resources.index)
    .filter(soilHeightPoint);

  return {
    openedSavedGarden,
    findPlant,
    dispatch: props.dispatch,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    getConfigValue: getWebAppConfigValue(() => props),
    soilHeightPoints,
    farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
    botOnline: isBotOnlineFromState(props.bot),
    arduinoBusy: props.bot.hardware.informational_settings.busy,
    currentBotLocation: validBotLocationData(props.bot.hardware.location_data)
      .position,
    movementState: props.app.movement,
    sourceFbosConfig: sourceFbosConfigValue(
      validFbosConfig(getFbosConfig(props.resources.index)),
      props.bot.hardware.configuration),
    botSize: botSize(props),
    curves: selectAllCurves(props.resources.index),
    plants: selectAllPlantPointers(props.resources.index),
  };
}

/**
 * All of the info a user would need to know about a plant, formatted and ready
 * to use by the UI.
 */
export interface FormattedPlantInfo {
  x: number;
  y: number;
  z: number;
  radius: number;
  depth: number | undefined;
  id: number | undefined;
  name: string;
  uuid: string;
  daysOld: number | undefined;
  plantedAt: moment.Moment | undefined;
  slug: string;
  plantStatus: PlantStage;
  meta?: Record<string, string | undefined>;
  water_curve_id?: number;
  spread_curve_id?: number;
  height_curve_id?: number;
}

/** Get date planted or fallback to creation date. */
const plantDate = (plant: TaggedPlant | TaggedPoint): moment.Moment => {
  const plantedAt = get(plant, "body.planted_at") as moment.MomentInput;
  const createdAt = get(plant, "body.created_at", moment()) as moment.MomentInput;
  return plantedAt ? moment(plantedAt) : moment(createdAt);
};

export interface PlantStageAndAge { age?: number, stage?: string }

/** Compare planted or created date vs time to determine age, or return stage. */
export const plantAgeAndStage =
  (plant: TaggedPlant | TaggedPoint): PlantStageAndAge => {
    // Plants and PlantTemplates should show stage instead of age if not planted
    if (get(plant, "body.pointer_type") != "Weed" &&
      !get(plant, "body.planted_at")) {
      return { stage: get(plant, "body.plant_stage", "planned") };
    }
    const currentDate = moment();
    const daysOld = currentDate.diff(plantDate(plant), "days") + 1;
    return { age: daysOld };
  };

export function formatPlantInfo(plant: TaggedPlant): FormattedPlantInfo {
  return {
    slug: plant.body.openfarm_slug,
    id: plant.body.id,
    name: plant.body.name,
    daysOld: plantAgeAndStage(plant).age,
    x: plant.body.x,
    y: plant.body.y,
    z: plant.body.z,
    radius: plant.body.radius,
    depth: plant.kind == "Point" ? plant.body.depth : undefined,
    uuid: plant.uuid,
    plantedAt: get(plant, "body.planted_at") ? plantDate(plant) : undefined,
    plantStatus: get(plant, "body.plant_stage", "planned"),
    meta: plant.kind == "Point" ? plant.body.meta : undefined,
    water_curve_id: plant.body["water_curve_id" as keyof (
      PlantPointer | PlantTemplate)] as number,
    spread_curve_id: plant.body["spread_curve_id" as keyof (
      PlantPointer | PlantTemplate)] as number,
    height_curve_id: plant.body["height_curve_id" as keyof (
      PlantPointer | PlantTemplate)] as number,
  };
}
