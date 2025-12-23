import { GetState } from "../../redux/interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { selectAllActivePoints } from "../../resources/selectors";
import { TaggedPoint } from "farmbot";
import { saveAll } from "../../api/crud";
import { Actions } from "../../constants";

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
    dispatch({
      type: Actions.BATCH_DESTROY_RESOURCE_OK,
      payload: plants,
    });
    return Promise.all([]);
  };
}
