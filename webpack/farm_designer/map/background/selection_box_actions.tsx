import { isNumber } from "lodash";
import { TaggedPlant, AxisNumberProperty, Mode } from "../interfaces";
import { SelectionBoxData } from "./selection_box";
import { Actions } from "../../../constants";
import { GardenMapState } from "../../interfaces";
import { getMode } from "../util";
import { history } from "../../../history";

/** Return all plants within the selection box. */
export const getSelected = (
  plants: TaggedPlant[],
  box: SelectionBoxData | undefined
): string[] | undefined => {
  const arraySelected = plants.filter(p => {
    if (box &&
      isNumber(box.x0) && isNumber(box.y0) &&
      isNumber(box.x1) && isNumber(box.y1)) {
      return (
        p.body.x >= Math.min(box.x0, box.x1) &&
        p.body.x <= Math.max(box.x0, box.x1) &&
        p.body.y >= Math.min(box.y0, box.y1) &&
        p.body.y <= Math.max(box.y0, box.y1)
      );
    }
  }).map(p => { return p.uuid; });
  return arraySelected.length > 0 ? arraySelected : undefined;
};

/** Resize a selection box. */
export const resizeBox = (props: {
  selectionBox: SelectionBoxData | undefined,
  plants: TaggedPlant[],
  gardenCoords: AxisNumberProperty | undefined,
  setMapState: (x: Partial<GardenMapState>) => void,
  dispatch: Function,
}) => {
  if (props.selectionBox) {
    const current = props.gardenCoords;
    if (current) {
      const { x0, y0 } = props.selectionBox;
      const newSelectionBox = {
        x0, y0, // Keep box starting corner
        x1: current.x, y1: current.y // Update box active corner
      };
      props.setMapState({ selectionBox: newSelectionBox });
      // Select all plants within the updated selection box
      const payload = getSelected(props.plants, newSelectionBox);
      if (payload && getMode() === Mode.none) {
        history.push("/app/designer/plants/select");
      }
      props.dispatch({ type: Actions.SELECT_PLANT, payload });
    }
  }
};

/** Create a new selection box. */
export const startNewSelectionBox = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  setMapState: (x: Partial<GardenMapState>) => void,
  dispatch: Function,
}) => {
  if (props.gardenCoords) {
    // Set the starting point (initial corner) of a  selection box
    props.setMapState({
      selectionBox: {
        x0: props.gardenCoords.x, y0: props.gardenCoords.y,
        x1: undefined, y1: undefined
      }
    });
  }
  // Clear the previous plant selection when starting a new selection box
  props.dispatch({ type: Actions.SELECT_PLANT, payload: undefined });
};
