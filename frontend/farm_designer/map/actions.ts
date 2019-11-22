import { MovePlantProps, DraggableEvent } from "../interfaces";
import { defensiveClone } from "../../util";
import { edit, overwrite } from "../../api/crud";
import { history } from "../../history";
import { Actions } from "../../constants";
import { svgToUrl, DEFAULT_ICON } from "../../open_farm/icons";
import { Mode } from "../map/interfaces";
import { clamp, uniq } from "lodash";
import { GetState } from "../../redux/interfaces";
import { fetchGroupFromUrl } from "../point_groups/group_detail";
import { TaggedPoint } from "farmbot";
import { getMode } from "../map/util";

export function movePlant(payload: MovePlantProps) {
  const tr = payload.plant;
  const update = defensiveClone(payload.plant).body;
  update.x += payload.deltaX;
  update.y += payload.deltaY;
  update.x = clamp(update.x, 0, payload.gridSize.x);
  update.y = clamp(update.y, 0, payload.gridSize.y);
  return edit(tr, update);
}

export const selectPlant = (payload: string[] | undefined) => {
  return { type: Actions.SELECT_PLANT, payload };
};

export const setHoveredPlant =
  (plantUUID: string | undefined, icon = "") => {
    return {
      type: Actions.TOGGLE_HOVERED_PLANT,
      payload: { plantUUID, icon }
    };
  };

export const clickMapPlant = (clickedPlantUuid: string, icon: string) => {
  return (dispatch: Function, getState: GetState) => {
    if (getMode() === Mode.editGroup) {
      const { resources } = getState();
      const group = fetchGroupFromUrl(resources.index);
      const point =
        resources.index.references[clickedPlantUuid] as TaggedPoint | undefined;
      if (group && point && point.body.id) {
        type Body = (typeof group)["body"];
        const nextGroup: Body = ({
          ...group.body,
          point_ids: [...group.body.point_ids.filter(p => p != point.body.id)]
        });
        if (!group.body.point_ids.includes(point.body.id)) {
          nextGroup.point_ids.push(point.body.id);
        }
        nextGroup.point_ids = uniq(nextGroup.point_ids);
        dispatch(overwrite(group, nextGroup));
      }
    } else {
      dispatch(selectPlant([clickedPlantUuid]));
      dispatch(setHoveredPlant(clickedPlantUuid, icon));
    }
  };
};

export const unselectPlant = (dispatch: Function) => () => {
  dispatch(selectPlant(undefined));
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
