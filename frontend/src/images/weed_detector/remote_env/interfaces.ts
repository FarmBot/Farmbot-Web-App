/** Name of every env var that the weed detector farmware needs. */
import { Primitive } from "../../../util";

/** Weed detector ENV key. */
export type WDENVKey =
  | "CAMERA_CALIBRATION_blur"
  | "CAMERA_CALIBRATION_calibration_along_axis"
  | "CAMERA_CALIBRATION_calibration_object_separation"
  | "CAMERA_CALIBRATION_camera_offset_x"
  | "CAMERA_CALIBRATION_camera_offset_y"
  | "CAMERA_CALIBRATION_coord_scale"
  | "CAMERA_CALIBRATION_H_HI"
  | "CAMERA_CALIBRATION_H_LO"
  | "CAMERA_CALIBRATION_image_bot_origin_location"
  | "CAMERA_CALIBRATION_invert_hue_selection"
  | "CAMERA_CALIBRATION_iteration"
  | "CAMERA_CALIBRATION_morph"
  | "CAMERA_CALIBRATION_S_HI"
  | "CAMERA_CALIBRATION_S_LO"
  | "CAMERA_CALIBRATION_total_rotation_angle"
  | "CAMERA_CALIBRATION_V_HI"
  | "CAMERA_CALIBRATION_V_LO"
  | "WEED_DETECTOR_blur"
  | "WEED_DETECTOR_H_HI"
  | "WEED_DETECTOR_H_LO"
  | "WEED_DETECTOR_iteration"
  | "WEED_DETECTOR_morph"
  | "WEED_DETECTOR_S_HI"
  | "WEED_DETECTOR_S_LO"
  | "WEED_DETECTOR_V_HI"
  | "WEED_DETECTOR_V_LO";

/** The entirety of ENV keys that the weed detector app needs to function.
 * Keys like HSV and whatnot. */
export type WD_ENV = Record<WDENVKey, number>;

/** Takes an internally formatted ENV var and formats it in a way that is useful
 * for the weed detector. Eg, convert 0 to "true". */
export type FormatterFn = (key: WDENVKey, val: number) => Primitive;

/** Takes a value from the outside world and parses it for use within this app.
 * Example: Turn "TOP_RIGHT" into the number 3. */
export type ParserFn = (key: WDENVKey, val: string) => number;

/** Object that contains two functions for translation of ENV variable keys. */
export interface Translation {
  /** Translate to output. FE => FBOS */
  format: FormatterFn;
  /** Translate to input. FBOS => FE */
  parse: ParserFn;
}

/** List of "special case" ENV vars from the weed detector that require
 * extra translation. */
export type FormatTranslationMap = Partial<Record<WDENVKey, Translation>>;
