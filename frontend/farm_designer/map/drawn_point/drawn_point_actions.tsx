import { Actions } from "../../../constants";
import { AxisNumberProperty } from "../interfaces";
import { DrawnPointPayl } from "../../interfaces";

export interface StartNewPointProps {
  gardenCoords: AxisNumberProperty | undefined;
  dispatch: Function;
  setMapState: Function;
  type: "point" | "weed";
}

/** Create a new point. */
export const startNewPoint = (props: StartNewPointProps) => {
  props.setMapState({ isDragging: true });
  const center = props.gardenCoords;
  if (center) {
    // Set the center of a new point
    props.dispatch({
      type: props.type == "weed"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: center.x, cy: center.y, r: 0 }
    });
  }
};

export interface ResizePointProps {
  gardenCoords: AxisNumberProperty | undefined;
  drawnPoint: DrawnPointPayl | undefined;
  dispatch: Function;
  isDragging: boolean | undefined;
  type: "point" | "weed";
}

/** Resize a point. */
export const resizePoint = (props: ResizePointProps) => {
  const edge = props.gardenCoords;
  if (edge && props.drawnPoint && !!props.isDragging) {
    const { cx, cy } = props.drawnPoint;
    // Adjust the radius of the point being created
    props.dispatch({
      type: props.type == "weed"
        ? Actions.SET_DRAWN_WEED_DATA
        : Actions.SET_DRAWN_POINT_DATA,
      payload: {
        cx, cy, // Center was set by click, radius is adjusted by drag
        r: Math.round(Math.sqrt(
          Math.pow(edge.x - cx, 2) + Math.pow(edge.y - cy, 2))),
      }
    });
  }
};
