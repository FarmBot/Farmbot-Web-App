import { GetState } from "../../redux/interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { selectAllActivePoints } from "../../resources/selectors";
import { TaggedPoint } from "farmbot";
import { destroy, saveAll } from "../../api/crud";

const filterByGridId = (gridId: string) =>
  (p: TaggedPoint) => p.body.meta["gridId"] === gridId;

function findPlantByGridId(index: ResourceIndex, gridId: string) {
  const allPlants = selectAllActivePoints(index);
  const myPlants = allPlants.filter(filterByGridId(gridId));
  return myPlants;
}

export function saveGrid(gridId: string) {
  return function (dispatch: Function, getState: GetState) {
    const plants = findPlantByGridId(getState().resources.index, gridId);
    const p = saveAll(plants);
    return dispatch(p) as Promise<{}>;
  };
}

export function stashGrid(gridId: string) {
  return function (dispatch: Function, getState: GetState) {
    const plants = findPlantByGridId(getState().resources.index, gridId);
    const all = plants.map((x): Promise<{}> => dispatch(destroy(x.uuid, true)));
    return Promise.all(all);
  };
}
