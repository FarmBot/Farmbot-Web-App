import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot,
  selectAllPeripherals
} from "../resources/selectors";
import { BotLocationData, StepsPerMmXY } from "../devices/interfaces";
import { isNumber } from "lodash";
import * as _ from "lodash";
import { minFwVersionCheck } from "../util";

export function mapStateToProps(props: Everything) {

  const plants = selectAllPlantPointers(props.resources.index);
  const maybeSelectedPlants = props.resources.consumers.farm_designer.selectedPlants;
  const selectedPlant = maybeSelectedPlants
    ? plants.filter(x => x.uuid === maybeSelectedPlants[0])[0]
    : undefined;
  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  const hoveredPlant = plants.filter(x => x.uuid === plantUUID)[0];

  const getBotLocationData = (): BotLocationData => {
    if (props.bot.hardware.location_data) {
      return props.bot.hardware.location_data;
    }
    return {
      position: { x: undefined, y: undefined, z: undefined },
      scaled_encoders: { x: undefined, y: undefined, z: undefined },
      raw_encoders: { x: undefined, y: undefined, z: undefined },
    };
  };

  function stepsPerMmXY(): StepsPerMmXY {
    const {
      mcu_params, configuration, informational_settings
    } = props.bot.hardware;
    const { steps_per_mm_x, steps_per_mm_y } = configuration;
    const { firmware_version } = informational_settings;
    const { movement_step_per_mm_x, movement_step_per_mm_y } = mcu_params;
    const stepsPerMm = () => {
      if (minFwVersionCheck(firmware_version, "5.0.5")) {
        return { x: movement_step_per_mm_x, y: movement_step_per_mm_y };
      } else {
        return { x: steps_per_mm_x, y: steps_per_mm_y };
      }
    };
    if (isNumber(stepsPerMm().x) && isNumber(stepsPerMm().y)) {
      return stepsPerMm();
    }
    return { x: undefined, y: undefined };
  }

  const peripherals = _.uniq(selectAllPeripherals(props.resources.index))
    .map(x => {
      const label = x.body.label;
      const pinStatus = x.body.pin
        ? props.bot.hardware.pins[x.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

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
    botLocationData: getBotLocationData(),
    botMcuParams: props.bot.hardware.mcu_params,
    stepsPerMmXY: stepsPerMmXY(),
    peripherals,
    eStopStatus: props.bot.hardware.informational_settings.locked
  };
}
