import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot
} from "../resources/selectors";
import { BotPosition, StepsPerMmXY } from "../devices/interfaces";
import { isNumber } from "lodash";

export function mapStateToProps(props: Everything) {

  const plants = selectAllPlantPointers(props.resources.index);
  const maybeSelectedPlants = props.resources.consumers.farm_designer.selectedPlants;
  const selectedPlant = maybeSelectedPlants
    ? plants.filter(x => x.uuid === maybeSelectedPlants[0])[0]
    : undefined;
  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  const hoveredPlant = plants.filter(x => x.uuid === plantUUID)[0];

  const getBotPosition = (): BotPosition => {
    if (props.bot.hardware.location_data) {
      return props.bot.hardware.location_data.position;
    }
    return { x: undefined, y: undefined, z: undefined };
  };

  function stepsPerMmXY(): StepsPerMmXY {
    const config = props.bot.hardware.configuration;
    if (isNumber(config.steps_per_mm_x) && isNumber(config.steps_per_mm_y)) {
      return { x: config.steps_per_mm_x, y: config.steps_per_mm_y };
    }
    return { x: undefined, y: undefined };
  }

  return {
    crops: selectAllCrops(props.resources.index),
    dispatch: props.dispatch,
    selectedPlant,
    zoomLevel: 1,
    designer: props.resources.consumers.farm_designer,
    points: selectAllGenericPointers(props.resources.index),
    toolSlots: joinToolsAndSlot(props.resources.index),
    hoveredPlant,
    plants,
    botPosition: getBotPosition(),
    botMcuParams: props.bot.hardware.mcu_params,
    stepsPerMmXY: stepsPerMmXY()
  };
}
