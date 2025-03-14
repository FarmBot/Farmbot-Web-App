import { Actions } from "../../../constants";
import { AxisNumberProperty } from "../interfaces";
import { DrawnPointPayl } from "../../interfaces";
import { xyDistance } from "../util";
import { isUndefined } from "lodash";

export interface StartNewPointProps {
  gardenCoords: AxisNumberProperty | undefined;
  dispatch: Function;
  setMapState: Function;
  drawnPoint: DrawnPointPayl | undefined;
}

/** Create a new point. */
export const startNewPoint = (props: StartNewPointProps) => {
  props.setMapState({ isDragging: true });
  const center = props.gardenCoords;
  if (center) {
    // Set the center of a new point
    props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        ...props.drawnPoint,
        cx: center.x, cy: center.y, r: 0,
      }
    });
  }
};

export interface ResizePointProps {
  gardenCoords: AxisNumberProperty | undefined;
  drawnPoint: DrawnPointPayl | undefined;
  dispatch: Function;
  isDragging: boolean | undefined;
}

/** Resize a point. */
export const resizePoint = (props: ResizePointProps) => {
  const edge = props.gardenCoords;
  if (edge && props.drawnPoint && !!props.isDragging) {
    const { cx, cy } = props.drawnPoint;
    if (isUndefined(cx) || isUndefined(cy)) { return; }
    // Adjust the radius of the point being created
    props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        ...props.drawnPoint,
        // Center was set by click, radius is adjusted by drag
        r: Math.round(xyDistance(edge, { x: cx, y: cy })),
      }
    });
  }
};
