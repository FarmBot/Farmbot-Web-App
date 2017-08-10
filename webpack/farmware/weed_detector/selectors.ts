import { DropDownItem, NULL_CHOICE } from "../../ui/fb_select";
import { SPECIAL_VALUE_DDI } from "./constants";
import { WD_ENV } from "./remote_env/interfaces";
import { envGet } from "./remote_env/selectors";

/** Convert values like SPECIAL_VALUES.TRUE to drop down items with friendly
 * label/value pairs. */
export let translateSpecialValue = (input: number): DropDownItem => {
  return SPECIAL_VALUE_DDI[input] || NULL_CHOICE;
};

/** Generates a lookup function to convert WeedDetector ENV items to
 * DropDownItems. Used to display currently selected options within dropdown
 * menus. */
export let getDropdownSelection = (env: Partial<WD_ENV>) =>
  (key: keyof WD_ENV): DropDownItem => {
    return translateSpecialValue(envGet(key, env));
  };
