import { MovePlantProps, DraggableEvent } from "../interfaces";
import { defensiveClone } from "../../util";
import { edit, overwrite } from "../../api/crud";
import { history } from "../../history";
import { Actions } from "../../constants";
import { svgToUrl, DEFAULT_ICON } from "../../open_farm/icons";
import { Mode } from "../map/interfaces";
import { clamp, uniq } from "lodash";
import { GetState } from "../../redux/interfaces";
import { findGroupFromUrl } from "../point_groups/group_detail";
import { TaggedPoint } from "farmbot";
import { getMode } from "../map/util";
import { ResourceIndex, UUID } from "../../resources/interfaces";
import { selectAllPointGroups } from "../../resources/selectors";

export function movePlant(payload: MovePlantProps) {
  const tr = payload.plant;
  const update = defensiveClone(payload.plant).body;
  update.x += payload.deltaX;
  update.y += payload.deltaY;
  update.x = clamp(update.x, 0, payload.gridSize.x);
  update.y = clamp(update.y, 0, payload.gridSize.y);
  return edit(tr, update);
}

export const selectPoint = (payload: string[] | undefined) => {
  return { type: Actions.SELECT_POINT, payload };
};

export const setHoveredPlant = (plantUUID: string | undefined, icon = "") => ({
  type: Actions.TOGGLE_HOVERED_PLANT,
  payload: { plantUUID, icon }
});

const addOrRemoveFromGroup =
  (clickedPlantUuid: UUID, resources: ResourceIndex) => {
    const group = findGroupFromUrl(selectAllPointGroups(resources));
    const point =
      resources.references[clickedPlantUuid] as TaggedPoint | undefined;
    if (group && point?.body.id) {
      type Body = (typeof group)["body"];
      const nextGroup: Body = ({
        ...group.body,
        point_ids: [...group.body.point_ids.filter(p => p != point.body.id)]
      });
      if (!group.body.point_ids.includes(point.body.id)) {
        nextGroup.point_ids.push(point.body.id);
      }
      nextGroup.point_ids = uniq(nextGroup.point_ids);
      return overwrite(group, nextGroup);
    }
  };

const addOrRemoveFromSelection =
  (clickedPointUuid: UUID, selectedPoints: UUID[] | undefined) => {
    const nextSelected =
      (selectedPoints || []).filter(uuid => uuid !== clickedPointUuid);
    if (!(selectedPoints?.includes(clickedPointUuid))) {
      nextSelected.push(clickedPointUuid);
    }
    return selectPoint(nextSelected);
  };

export const clickMapPlant = (clickedPlantUuid: UUID, icon: string) => {
  return (dispatch: Function, getState: GetState) => {
    switch (getMode()) {
      case Mode.editGroup:
        const { resources } = getState();
        dispatch(addOrRemoveFromGroup(clickedPlantUuid, resources.index));
        break;
      case Mode.boxSelect:
        const { selectedPoints } = getState().resources.consumers.farm_designer;
        dispatch(addOrRemoveFromSelection(clickedPlantUuid, selectedPoints));
        break;
      default:
        dispatch(selectPoint([clickedPlantUuid]));
        dispatch(setHoveredPlant(clickedPlantUuid, icon));
        break;
    }
  };
};

export const unselectPlant = (dispatch: Function) => () => {
  dispatch(selectPoint(undefined));
  dispatch(setHoveredPlant(undefined));
  dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
};

/** Unselect plant and close plant info or select panel if selected and open. */
export const closePlantInfo = (dispatch: Function) => () => {
  const mode = getMode();
  if (mode == Mode.editPlant || mode == Mode.boxSelect) {
    unselectPlant(dispatch)();
    history.push("/app/designer/plants");
  }
};

export const setDragIcon =
  (icon: string | undefined) => (e: DraggableEvent) => {
    const dragImg = new Image();
    dragImg.src = icon ? svgToUrl(icon) : DEFAULT_ICON;
    const width = dragImg.naturalWidth;
    const height = dragImg.naturalHeight;
    e.dataTransfer.setDragImage
      && e.dataTransfer.setDragImage(dragImg, width / 2, height / 2);
  };

export const mapPointClickAction =
  (dispatch: Function, uuid: UUID, path?: string) => () => {
    switch (getMode()) {
      case Mode.editGroup:
      case Mode.boxSelect:
        return dispatch(clickMapPlant(uuid, ""));
      default:
        return path && history.push(path);
    }
  };
