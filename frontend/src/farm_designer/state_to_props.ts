import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot,
  findPlant
} from "../resources/selectors";

export function mapStateToProps(props: Everything) {

  let plants = selectAllPlantPointers(props.resources.index);
  let selectedPlant = plants
    .filter(x => x.uuid === props
      .resources
      .consumers
      .farm_designer
      .selectedPlant)[0];
  let { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  let hoveredPlant = plantUUID ?
    findPlant(props.resources.index, plantUUID) : undefined;

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
    bot: props.bot
  };
}
