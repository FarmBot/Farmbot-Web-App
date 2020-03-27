import {
  BooleanConfigKey,
  NumberConfigKey,
} from "farmbot/dist/resources/configs/web_app";

export const BooleanSetting: Record<BooleanConfigKey, BooleanConfigKey> = {
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
  show_historic_points: "show_historic_points",
  show_spread: "show_spread",
  show_farmbot: "show_farmbot",
  show_images: "show_images",
  show_weeds: "show_weeds",
  show_zones: "show_zones",
  show_sensor_readings: "show_sensor_readings",
  disable_animations: "disable_animations",
  display_trail: "display_trail",
  encoder_figure: "encoder_figure",
  dynamic_map: "dynamic_map",
  xy_swap: "xy_swap",
  confirm_plant_deletion: "confirm_plant_deletion",

  /** Sequence settings */
  confirm_step_deletion: "confirm_step_deletion",
  confirm_sequence_deletion: "confirm_sequence_deletion",
  show_pins: "show_pins",
  expand_step_options: "expand_step_options",
  discard_unsaved_sequences: "discard_unsaved_sequences",

  /** App settings */
  disable_i18n: "disable_i18n",
  hide_webcam_widget: "hide_webcam_widget",
  hide_sensors: "hide_sensors",
  enable_browser_speak: "enable_browser_speak",
  discard_unsaved: "discard_unsaved",
  time_format_24_hour: "time_format_24_hour",
  disable_emergency_unlock_confirmation: "disable_emergency_unlock_confirmation",
  user_interface_read_only_mode: "user_interface_read_only_mode",

  /** Farmware settings */
  show_first_party_farmware: "show_first_party_farmware",

  /** Other */
  stub_config: "stub_config",
};

export const NumericSetting: Record<NumberConfigKey, NumberConfigKey> = {
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
