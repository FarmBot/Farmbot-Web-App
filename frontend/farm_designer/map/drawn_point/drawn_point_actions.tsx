import { Actions } from "../../../constants";
import { AxisNumberProperty } from "../interfaces";
import { CurrentPointPayl } from "../../interfaces";

/** Create a new point. */
export const startNewPoint = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  dispatch: Function,
  setMapState: Function,
}) => {
  props.setMapState({ isDragging: true });
  const center = props.gardenCoords;
  if (center) {
    // Set the center of a new point
    props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: { cx: center.x, cy: center.y, r: 0 }
    });
  }
};

/** Resize a point. */
export const resizePoint = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  currentPoint: CurrentPointPayl | undefined,
  dispatch: Function,
  isDragging: boolean | undefined,
}) => {
  const edge = props.gardenCoords;
  if (edge && props.currentPoint && !!props.isDragging) {
    const { cx, cy } = props.currentPoint;
    // Adjust the radius of the point being created
    props.dispatch({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: {
        cx, cy, // Center was set by click, radius is adjusted by drag
        r: Math.round(Math.sqrt(
          Math.pow(edge.x - cx, 2) + Math.pow(edge.y - cy, 2))),
      }
    });
  }
};
