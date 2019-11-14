import { GetState } from "../../../redux/interfaces"
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllPlantPointers } from "../../../resources/selectors";
import { TaggedPlantPointer } from "farmbot";
import { destroy, saveAll } from "../../../api/crud";
const filter = (gridId: string) =>
  (p: TaggedPlantPointer) => p.body.meta["gridId"] === gridId;

function findPlantByGridId(index: ResourceIndex, gridId: string) {
  const allPlants = selectAllPlantPointers(index);
  const myPlants = allPlants.filter(filter(gridId));
  return myPlants;
}

export function saveGrid(_gridId: string) {
  return function (dispatch: Function, _getState: GetState) {
    const plants = findPlantByGridId(_getState().resources.index, _gridId);
    const p = saveAll(plants);
    console.log("Saving the grid");
    return dispatch(p) as Promise<{}>;
  };
}

export function stashGrid(_gridId: string) {
  return function (dispatch: Function, _getState: GetState) {
    const plants = findPlantByGridId(_getState().resources.index, _gridId);
    const all = plants.map((x): Promise<{}> => dispatch(destroy(x.uuid, true)));
    return Promise.all(all);
  };
}
