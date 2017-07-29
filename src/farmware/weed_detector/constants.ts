import { DropDownItem } from "../../ui/index";
import { SPECIAL_VALUES } from "./remote_env/constants";

/** Mapping of SPECIAL_VALUE numeric codes into corresponding drop down items. */
export const SPECIAL_VALUE_DDI = {
  [SPECIAL_VALUES.X]: {
    label: "X",
    value: SPECIAL_VALUES.X
  },
  [SPECIAL_VALUES.Y]: {
    label: "Y",
    value: SPECIAL_VALUES.Y
  },
  [SPECIAL_VALUES.TOP_LEFT]: {
    label: "Top Left",
    value: SPECIAL_VALUES.TOP_LEFT
  },
  [SPECIAL_VALUES.TOP_RIGHT]: {
    label: "Top Right",
    value: SPECIAL_VALUES.TOP_RIGHT
  },
  [SPECIAL_VALUES.BOTTOM_LEFT]: {
    label: "Bottom Left",
    value: SPECIAL_VALUES.BOTTOM_LEFT
  },
  [SPECIAL_VALUES.BOTTOM_RIGHT]: {
    label: "Bottom Right",
    value: SPECIAL_VALUES.BOTTOM_RIGHT
  },
}

export const CALIBRATION_DROPDOWNS: DropDownItem[] = [
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.X],
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.Y]
];

export const ORIGIN_DROPDOWNS: DropDownItem[] = [
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.TOP_LEFT],
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.TOP_RIGHT],
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.BOTTOM_LEFT],
  SPECIAL_VALUE_DDI[SPECIAL_VALUES.BOTTOM_RIGHT],
];
