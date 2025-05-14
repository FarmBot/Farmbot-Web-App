import {
  BooleanConfigKey as BooleanWebAppConfigKey,
  StringConfigKey as StringWebAppConfigKey,
  NumberConfigKey as NumberWebAppConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { getWebAppConfigValue } from "../config_storage/actions";
import { store } from "../redux/store";
import { BooleanSetting } from "../session_keys";
import { FirmwareHardware } from "farmbot";
import { cloneDeep } from "lodash";
import { getFbosConfig } from "../resources/getters";
import { getFwHardwareValue } from "./firmware/firmware_hardware_support";

type Key = BooleanWebAppConfigKey | StringWebAppConfigKey | NumberWebAppConfigKey;
type Value = string | number | boolean | undefined;
const DEFAULT_WEB_APP_CONFIG_VALUES: Record<Key, Value> = {
  id: 0,
  device_id: 0,
  created_at: 0,
  updated_at: 0,
  confirm_step_deletion: false,
  disable_animations: false,
  disable_i18n: false,
  display_trail: true,
  dynamic_map: false,
  enable_3d_electronics_box_top: true,
  encoder_figure: false,
  go_button_axes: "XY",
  hide_webcam_widget: false,
  landing_page: "plants",
  legend_menu_open: true,
  raw_encoders: false,
  scaled_encoders: false,
  show_spread: true,
  show_farmbot: true,
  show_plants: true,
  show_points: true,
  x_axis_inverted: false,
  y_axis_inverted: false,
  z_axis_inverted: false,
  bot_origin_quadrant: 2,
  zoom_level: "-2",
  success_log: 1,
  busy_log: 1,
  warn_log: 1,
  error_log: 1,
  info_log: 1,
  fun_log: 1,
  debug_log: 1,
  stub_config: false,
  show_first_party_farmware: false,
  enable_browser_speak: false,
  beep_verbosity: 0,
  show_images: true,
  photo_filter_begin: "",
  photo_filter_end: "",
  discard_unsaved: false,
  xy_swap: false,
  home_button_homing: true,
  show_motor_plot: false,
  show_missed_step_plot: false,
  show_historic_points: false,
  show_soil_interpolation_map: false,
  show_sensor_readings: false,
  show_moisture_interpolation_map: false,
  time_format_24_hour: false,
  show_pins: false,
  disable_emergency_unlock_confirmation: true,
  map_size_x: 2900,
  map_size_y: 1230,
  expand_step_options: false,
  hide_sensors: false,
  confirm_plant_deletion: true,
  confirm_sequence_deletion: true,
  discard_unsaved_sequences: false,
  user_interface_read_only_mode: false,
  assertion_log: 1,
  show_zones: false,
  show_weeds: true,
  display_map_missed_steps: false,
  time_format_seconds: false,
  crop_images: true,
  clip_image_layer: true,
  show_camera_view_area: true,
  show_uncropped_camera_view_area: false,
  default_plant_depth: 5,
  view_celery_script: false,
  highlight_modified_settings: true,
  show_advanced_settings: false,
  three_d_garden: false,
  dark_mode: true,
};

const DEFAULT_EXPRESS_WEB_APP_CONFIG_VALUES =
  cloneDeep(DEFAULT_WEB_APP_CONFIG_VALUES);
DEFAULT_EXPRESS_WEB_APP_CONFIG_VALUES.hide_sensors = true;
DEFAULT_EXPRESS_WEB_APP_CONFIG_VALUES.map_size_y = 1200;
const DEFAULT_GENESIS_WEB_APP_CONFIG_VALUES = DEFAULT_WEB_APP_CONFIG_VALUES;

const getDefaultConfigValue =
  (firmwareHardware: FirmwareHardware | undefined) =>
    (key: Key): Value => {
      switch (firmwareHardware) {
        case "arduino":
        case "farmduino":
        case "farmduino_k14":
        case "farmduino_k15":
        case "farmduino_k16":
        case "farmduino_k17":
        case "farmduino_k18":
          return DEFAULT_GENESIS_WEB_APP_CONFIG_VALUES[key];
        case "express_k10":
        case "express_k11":
        case "express_k12":
          return DEFAULT_EXPRESS_WEB_APP_CONFIG_VALUES[key];
        default:
          return DEFAULT_WEB_APP_CONFIG_VALUES[key];
      }
    };

export const getModifiedClassNameSpecifyModified = (modified: boolean) => {
  const getValue = getWebAppConfigValue(store.getState);
  const authAud = store.getState().auth?.token.unencoded.aud;
  const highlightModified = getValue(BooleanSetting.highlight_modified_settings);
  return (highlightModified || authAud == "staff") && modified ? "modified" : "";
};

export const getModifiedClassNameSpecifyDefault =
  (value: Value, defaultValue: Value) =>
    getModifiedClassNameSpecifyModified(defaultValue != value);

export const getModifiedClassNameDefaultFalse = (value: Value) =>
  getModifiedClassNameSpecifyModified(!!value);

export const getModifiedClassName = (key: Key) =>
  getModifiedClassNameSpecifyModified(modifiedFromDefault(key));

const modifiedFromDefault = (key: Key) => {
  const getValue = getWebAppConfigValue(store.getState);
  const value = getValue(key);
  const firmwareHardware = getFwHardwareValue(getFbosConfig(
    store.getState().resources.index));
  const defaultValue = getDefaultConfigValue(firmwareHardware)(key);
  return defaultValue != value;
};
