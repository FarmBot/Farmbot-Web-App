import { MovePlantProps, DraggableEvent } from "./interfaces";
import { defensiveClone } from "../util";
import { edit } from "../api/crud";
import * as _ from "lodash";
import { history, getPathArray } from "../history";
import { Actions } from "../constants";
import { svgToUrl, DEFAULT_ICON } from "../open_farm/icons";
import { getMode } from "./map/util";
import { Mode } from "./map/interfaces";

export function movePlant(payload: MovePlantProps) {
  const tr = payload.plant;
  const update = defensiveClone(payload.plant).body;
  update.x += payload.deltaX;
  update.y += payload.deltaY;
  update.x = _.clamp(update.x, 0, payload.gridSize.x);
  update.y = _.clamp(update.y, 0, payload.gridSize.y);
  return edit(tr, update);
}

export const unselectPlant = (dispatch: Function) => () => {
  dispatch({ type: Actions.SELECT_PLANT, payload: undefined });
  dispatch({
    type: Actions.TOGGLE_HOVERED_PLANT, payload: {
      plantUUID: undefined, icon: ""
    }
  });
  dispatch({ type: Actions.HOVER_PLANT_LIST_ITEM, payload: undefined });
};

export const closePlantInfo = (dispatch: Function) => () => {
  if (!isNaN(parseInt(getPathArray().slice(-1)[0]))
    || getMode() == Mode.boxSelect) {
    // A plant is selected and plant info or select panel is open.
    // Unselect and close.
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
