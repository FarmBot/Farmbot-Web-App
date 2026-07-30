import { GetState } from "../../redux/interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { selectAllActivePoints } from "../../resources/selectors";
import { TaggedPoint, TaggedResource } from "farmbot";
import { saveAll } from "../../api/crud";
import { Actions } from "../../constants";

const filterByGridId = (gridId: string) =>
  (p: TaggedPoint) => p.body.meta["gridId"] === gridId;

function findPlantByGridId(index: ResourceIndex, gridId: string) {
  const allPlants = selectAllActivePoints(index);
  const myPlants = allPlants.filter(filterByGridId(gridId));
  return myPlants;
}

const findGridResources = (
  index: ResourceIndex,
  gridId: string,
  resourceUuids: string[] | undefined,
): TaggedResource[] =>
  resourceUuids
    ? resourceUuids
      .map(uuid => index.references[uuid])
      .filter((resource): resource is TaggedResource => !!resource)
    : findPlantByGridId(index, gridId);

export function saveGrid(gridId: string, resourceUuids?: string[]) {
  return function (dispatch: Function, getState: GetState) {
    const plants = findGridResources(
      getState().resources.index, gridId, resourceUuids);
    const p = saveAll(plants, undefined, saveError => {
      throw saveError;
    });
    return dispatch(p) as Promise<{}>;
  };
}

export function stashGrid(gridId: string, resourceUuids?: string[]) {
  return function (dispatch: Function, getState: GetState) {
    const plants = findGridResources(
      getState().resources.index, gridId, resourceUuids);
    dispatch({
      type: Actions.BATCH_DESTROY_RESOURCE_OK,
      payload: plants,
    });
    return Promise.all([]);
  };
}
