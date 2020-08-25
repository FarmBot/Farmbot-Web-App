import {
  BooleanConfigKey as WebAppBooleanConfigKey,
  NumberConfigKey as WebAppNumberConfigKey,
  StringConfigKey as WebAppStringConfigKey,
} from "farmbot/dist/resources/configs/web_app";

type WebAppBooleanConfigKeyAll = WebAppBooleanConfigKey
  | "time_format_seconds"
  | "crop_images"
  | "show_camera_view_area"
  | "view_celery_script"
  | "highlight_modified_settings";
type WebAppNumberConfigKeyAll = WebAppNumberConfigKey;
type WebAppStringConfigKeyAll = WebAppStringConfigKey;

export const BooleanSetting:
  Record<WebAppBooleanConfigKeyAll, WebAppBooleanConfigKey> = {
  /** Move settings */
  x_axis_inverted: "x_axis_inverted",
  y_axis_inverted: "y_axis_inverted",
  z_axis_inverted: "z_axis_inverted",
  scaled_encoders: "scaled_encoders",
  raw_encoders: "raw_encoders",
  home_button_homing: "home_button_homing",
  show_motor_plot: "show_motor_plot",

  /** Designer settings */
  legend_menu_open: "legend_menu_open",
  show_plants: "show_plants",
  show_points: "show_points",
  show_weeds: "show_weeds",
  show_historic_points: "show_historic_points",
  show_spread: "show_spread",
  show_farmbot: "show_farmbot",
  show_images: "show_images",
  show_zones: "show_zones",
  show_sensor_readings: "show_sensor_readings",
  show_camera_view_area: "show_camera_view_area" as WebAppBooleanConfigKey,
  disable_animations: "disable_animations",
  display_map_missed_steps: "display_map_missed_steps",
  display_trail: "display_trail",
  encoder_figure: "encoder_figure",
  dynamic_map: "dynamic_map",
  xy_swap: "xy_swap",
  confirm_plant_deletion: "confirm_plant_deletion",
  crop_images: "crop_images" as WebAppBooleanConfigKey,
  highlight_modified_settings: "highlight_modified_settings" as WebAppBooleanConfigKey,

  /** Sequence settings */
  confirm_step_deletion: "confirm_step_deletion",
  confirm_sequence_deletion: "confirm_sequence_deletion",
  show_pins: "show_pins",
  expand_step_options: "expand_step_options",
  discard_unsaved_sequences: "discard_unsaved_sequences",
  view_celery_script: "view_celery_script" as WebAppBooleanConfigKey,

  /** App settings */
  disable_i18n: "disable_i18n",
  hide_webcam_widget: "hide_webcam_widget",
  hide_sensors: "hide_sensors",
  enable_browser_speak: "enable_browser_speak",
  discard_unsaved: "discard_unsaved",
  time_format_24_hour: "time_format_24_hour",
  time_format_seconds: "time_format_seconds" as WebAppBooleanConfigKey,
  disable_emergency_unlock_confirmation: "disable_emergency_unlock_confirmation",
  user_interface_read_only_mode: "user_interface_read_only_mode",

  /** Farmware settings */
  show_first_party_farmware: "show_first_party_farmware",

  /** Other */
  stub_config: "stub_config",
};

export const NumericSetting:
  Record<WebAppNumberConfigKeyAll, WebAppNumberConfigKey> = {
  /** Logs settings */
  assertion_log: "assertion_log",
  success_log: "success_log",
  busy_log: "busy_log",
  warn_log: "warn_log",
  error_log: "error_log",
  info_log: "info_log",
  fun_log: "fun_log",
  debug_log: "debug_log",

  /** Designer settings */
  zoom_level: "zoom_level",
  map_size_x: "map_size_x",
  map_size_y: "map_size_y",
  bot_origin_quadrant: "bot_origin_quadrant",

  /** Other */
  id: "id",
  device_id: "device_id",
};

export const StringSetting:
  Record<WebAppStringConfigKeyAll, WebAppStringConfigKey> = {
  /** Designer settings */
  photo_filter_begin: "photo_filter_begin",
  photo_filter_end: "photo_filter_end",

  /** Other */
  created_at: "created_at",
  updated_at: "updated_at",
};
