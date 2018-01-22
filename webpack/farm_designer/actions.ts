import { MovePlantProps } from "./interfaces";
import { defensiveClone } from "../util";
import { edit } from "../api/crud";
import * as _ from "lodash";
import { history, getPathArray } from "../history";

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
  dispatch({ type: "SELECT_PLANT", payload: undefined });
  dispatch({
    type: "TOGGLE_HOVERED_PLANT", payload: {
      plantUUID: undefined, icon: ""
    }
  });
};

export const closePlantInfo = (dispatch: Function) => () => {
  if (!isNaN(parseInt(getPathArray().slice(-1)[0]))) {
    // A plant is selected and plant info is open. Unselect and close it.
    unselectPlant(dispatch)();
    history.push("/app/designer/plants");
  }
};
