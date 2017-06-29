import { box } from "boxed_value";
import * as _ from "lodash";
import { WDENVKey, WD_ENV, Translation, FormatTranslationMap } from "./interfaces";

/** I would rather not deal with all the weird edge cases that come with
 * supporting strings and numbers right now. It adds too many edge cases for the
 * FE to validate against. Example: Needing to conditionally determine if an ENV
 * key is string vs. number vs. bool. Using only numbers (and translating values
 * when transmitting) allows us to minimize the use of such conditionals.
 * When we need to support text that users will read, I can re-visit this. */
export enum SPECIAL_VALUES {
  FALSE = 0,
  TRUE = 1,
  TOP_LEFT = 2,
  TOP_RIGHT = 3,
  BOTTOM_LEFT = 4,
  BOTTOM_RIGHT = 5,
  X = 6,
  Y = 7
}

/** The runtime equivalent for WeedDetectorENVKey.
 *  Good for iterating and whatnot. */
export const EVERY_KEY: WDENVKey[] = [
  "CAMERA_CALIBRATION_blur",
  "CAMERA_CALIBRATION_calibration_along_axis",
  "CAMERA_CALIBRATION_calibration_object_separation",
  "CAMERA_CALIBRATION_camera_offset_x",
  "CAMERA_CALIBRATION_camera_offset_y",
  "CAMERA_CALIBRATION_coord_scale",
  "CAMERA_CALIBRATION_H_HI",
  "CAMERA_CALIBRATION_H_LO",
  "CAMERA_CALIBRATION_image_bot_origin_location",
  "CAMERA_CALIBRATION_invert_hue_selection",
  "CAMERA_CALIBRATION_iteration",
  "CAMERA_CALIBRATION_morph",
  "CAMERA_CALIBRATION_S_HI",
  "CAMERA_CALIBRATION_S_LO",
  "CAMERA_CALIBRATION_total_rotation_angle",
  "CAMERA_CALIBRATION_V_HI",
  "CAMERA_CALIBRATION_V_LO",
  "WEED_DETECTOR_blur",
  "WEED_DETECTOR_H_HI",
  "WEED_DETECTOR_H_LO",
  "WEED_DETECTOR_iteration",
  "WEED_DETECTOR_morph",
  "WEED_DETECTOR_S_HI",
  "WEED_DETECTOR_S_LO",
  "WEED_DETECTOR_V_HI",
  "WEED_DETECTOR_V_LO"
];

/** Sometimes, ENV var values are not available but rendering must still be
 * performed. This map provides a set of defaults for every ENV var. */
export const DEFAULTS: WD_ENV = {
  CAMERA_CALIBRATION_calibration_along_axis: SPECIAL_VALUES.X,
  CAMERA_CALIBRATION_image_bot_origin_location: SPECIAL_VALUES.BOTTOM_LEFT,
  CAMERA_CALIBRATION_invert_hue_selection: SPECIAL_VALUES.FALSE,
  CAMERA_CALIBRATION_blur: 15,
  CAMERA_CALIBRATION_calibration_object_separation: 0,
  CAMERA_CALIBRATION_camera_offset_x: 0,
  CAMERA_CALIBRATION_camera_offset_y: 0,
  CAMERA_CALIBRATION_coord_scale: 0,
  CAMERA_CALIBRATION_H_HI: 90,
  CAMERA_CALIBRATION_H_LO: 30,
  CAMERA_CALIBRATION_iteration: 4,
  CAMERA_CALIBRATION_morph: 6,
  CAMERA_CALIBRATION_S_HI: 255,
  CAMERA_CALIBRATION_S_LO: 50,
  CAMERA_CALIBRATION_total_rotation_angle: 0,
  CAMERA_CALIBRATION_V_HI: 255,
  CAMERA_CALIBRATION_V_LO: 50,
  WEED_DETECTOR_blur: 15,
  WEED_DETECTOR_H_HI: 90,
  WEED_DETECTOR_H_LO: 30,
  WEED_DETECTOR_iteration: 4,
  WEED_DETECTOR_morph: 6,
  WEED_DETECTOR_S_HI: 255,
  WEED_DETECTOR_S_LO: 50,
  WEED_DETECTOR_V_HI: 255,
  WEED_DETECTOR_V_LO: 50,
};

export const DEFAULT_FORMATTER: Translation = {
  format: (key, val): number | string => {
    switch (key) {
      case "CAMERA_CALIBRATION_calibration_along_axis":
      case "CAMERA_CALIBRATION_image_bot_origin_location":
      case "CAMERA_CALIBRATION_invert_hue_selection":
        return ("" + (SPECIAL_VALUES[val] || val));
      default:
        return val;
    }
  },
  parse: (key, val) => {
    try {
      const b = box(JSON.parse(val));
      switch (b.kind) {
        case "number":
          return b.value;
        case "boolean":
        case "string":
          return getSpecialValue(val);
        default:
          throw new Error("BAD DATA TYPE");
      }

    } catch (error) {
      throw new Error(`An input from FarmWare caused a crash.
      This is the value we got: ${val}
      This is the error: ${error}
      `);
    }
  }
};
/** If we hit any "special cases", we can register them here. */
export const TRANSLATORS: FormatTranslationMap = {};
/** We only expect certain string values from the weed detector.
 * Tokens like "BOTTOM_RIGHT" or "X" all have a numeric counterpart.
 * This function converts such strings to their numeric equivalent.
 * If a matching numeric code is not found, throws an exception.
 */
export function getSpecialValue(key: string | number):
  SPECIAL_VALUES {

  let k = _.snakeCase(("" + key).toUpperCase()).toUpperCase();
  let v = _.get(SPECIAL_VALUES, k, NaN);

  if (_.isUndefined(v) || _.isNaN(v)) {
    throw new Error("Not a SPECIAL_VALUE: " + k);
  } else {
    return v;
  }
}
