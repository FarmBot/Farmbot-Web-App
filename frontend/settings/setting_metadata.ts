import { Content, DeviceSetting, ToolTips } from "../constants";
import {
  BooleanSetting, NumericSetting, StringSetting,
} from "../session_keys";
import { Config, SurfaceDebugOption } from "../three_d_garden/config";

export type PaletteSettingControl =
  | "toggle"
  | "number"
  | "select"
  | "axes";

export interface PaletteSettingMetadata {
  label: string;
  englishName?: string;
  help?: string;
  control: PaletteSettingControl;
  inverted?: boolean;
  defaultOn?: boolean;
  mapLayer?: boolean;
  requires3D?: boolean;
  callback?: "resetVirtualTrail";
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Settings rendered by the Settings panel.
 *
 * Keep this explicit. Enumerating resource keys exposes internal or stale
 * configuration values that have no corresponding Settings-panel control.
 */
export const WEB_APP_BOOLEAN_SETTINGS: Record<
  string, PaletteSettingMetadata
> = {
  [BooleanSetting.show_advanced_settings]: {
    label: DeviceSetting.showAdvancedSettings,
    control: "toggle",
  },
  [BooleanSetting.highlight_modified_settings]: {
    label: DeviceSetting.highlightModifiedSettings,
    control: "toggle",
  },
  [BooleanSetting.disable_animations]: {
    label: DeviceSetting.animations,
    help: Content.PLANT_ANIMATIONS,
    control: "toggle",
    inverted: true,
  },
  [BooleanSetting.display_trail]: {
    label: DeviceSetting.trail,
    help: Content.VIRTUAL_TRAIL,
    control: "toggle",
    callback: "resetVirtualTrail",
  },
  [BooleanSetting.display_map_missed_steps]: {
    label: DeviceSetting.mapMissedSteps,
    help: Content.MAP_MISSED_STEPS,
    control: "toggle",
  },
  [BooleanSetting.dynamic_map]: {
    label: DeviceSetting.dynamicMap,
    help: Content.DYNAMIC_MAP_SIZE,
    control: "toggle",
  },
  [BooleanSetting.xy_swap]: {
    label: DeviceSetting.swapXAndYAxisJogButtons,
    englishName: "Swap X and Y axis jog buttons",
    help: Content.MAP_SWAP_XY,
    control: "toggle",
  },
  [BooleanSetting.crop_images]: {
    label: DeviceSetting.cropMapImages,
    help: Content.CROP_MAP_IMAGES,
    control: "toggle",
  },
  [BooleanSetting.clip_image_layer]: {
    label: DeviceSetting.clipPhotosOutOfBounds,
    help: Content.CLIP_PHOTOS_OUT_OF_BOUNDS,
    control: "toggle",
  },
  [BooleanSetting.show_camera_view_area]: {
    label: DeviceSetting.cameraView,
    help: Content.SHOW_CAMERA_VIEW_AREA,
    control: "toggle",
  },
  [BooleanSetting.show_uncropped_camera_view_area]: {
    label: DeviceSetting.uncroppedCameraView,
    help: Content.SHOW_UNCROPPED_CAMERA_VIEW_AREA,
    control: "toggle",
  },
  [BooleanSetting.confirm_plant_deletion]: {
    label: DeviceSetting.confirmPlantDeletion,
    help: Content.CONFIRM_PLANT_DELETION,
    control: "toggle",
    defaultOn: true,
  },
  [BooleanSetting.show_plants]: {
    label: DeviceSetting.showPlantsMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_points]: {
    label: DeviceSetting.showPointsMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_weeds]: {
    label: DeviceSetting.showWeedsMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_historic_points]: {
    label: DeviceSetting.showRemovedWeedsMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_soil_interpolation_map]: {
    label: DeviceSetting.showSoilInterpolationMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_spread]: {
    label: DeviceSetting.showSpreadMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_farmbot]: {
    label: DeviceSetting.showFarmbotMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_images]: {
    label: DeviceSetting.showPhotosMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_zones]: {
    label: DeviceSetting.showAreasMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_sensor_readings]: {
    label: DeviceSetting.showReadingsMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_moisture_interpolation_map]: {
    label: DeviceSetting.showMoistureInterpolationMapLayer,
    control: "toggle",
    mapLayer: true,
  },
  [BooleanSetting.show_scene_objects]: {
    label: DeviceSetting.showSceneObjectsMapLayer,
    control: "toggle",
    mapLayer: true,
    requires3D: true,
  },
  [BooleanSetting.x_axis_inverted]: {
    label: DeviceSetting.invertXAxisJogButton,
    control: "toggle",
  },
  [BooleanSetting.y_axis_inverted]: {
    label: DeviceSetting.invertYAxisJogButton,
    control: "toggle",
  },
  [BooleanSetting.z_axis_inverted]: {
    label: DeviceSetting.invertZAxisJogButton,
    control: "toggle",
  },
  [BooleanSetting.scaled_encoders]: {
    label: DeviceSetting.displayScaledEncoderPosition,
    help: "Display Encoder Data",
    control: "toggle",
  },
  [BooleanSetting.raw_encoders]: {
    label: DeviceSetting.displayRawEncoderPosition,
    help: "Display Encoder Data",
    control: "toggle",
  },
  [BooleanSetting.show_motor_plot]: {
    label: DeviceSetting.showMotorPositionPlotDisplay,
    control: "toggle",
  },
  [BooleanSetting.show_missed_step_plot]: {
    label: DeviceSetting.showMotorLoadPlotDisplay,
    control: "toggle",
  },
  [BooleanSetting.confirm_step_deletion]: {
    label: DeviceSetting.confirmStepDeletion,
    help: Content.CONFIRM_STEP_DELETION,
    control: "toggle",
  },
  [BooleanSetting.confirm_sequence_deletion]: {
    label: DeviceSetting.confirmSequenceDeletion,
    help: Content.CONFIRM_SEQUENCE_DELETION,
    control: "toggle",
  },
  [BooleanSetting.show_pins]: {
    label: DeviceSetting.showPins,
    help: Content.SHOW_PINS,
    control: "toggle",
  },
  [BooleanSetting.expand_step_options]: {
    label: DeviceSetting.openOptionsByDefault,
    help: Content.EXPAND_STEP_OPTIONS,
    control: "toggle",
  },
  [BooleanSetting.discard_unsaved_sequences]: {
    label: DeviceSetting.discardUnsavedSequenceChanges,
    help: Content.DISCARD_UNSAVED_SEQUENCE_CHANGES,
    control: "toggle",
  },
  [BooleanSetting.view_celery_script]: {
    label: DeviceSetting.viewCeleryScript,
    help: Content.VIEW_CELERY_SCRIPT,
    control: "toggle",
  },
  [BooleanSetting.disable_i18n]: {
    label: DeviceSetting.internationalizeWebApp,
    help: Content.INTERNATIONALIZE_WEB_APP,
    control: "toggle",
    inverted: true,
  },
  [BooleanSetting.time_format_24_hour]: {
    label: DeviceSetting.use24hourTimeFormat,
    help: Content.TIME_FORMAT_24_HOUR,
    control: "toggle",
  },
  [BooleanSetting.time_format_seconds]: {
    label: DeviceSetting.showSecondsInTime,
    help: Content.TIME_FORMAT_SECONDS,
    control: "toggle",
  },
  [BooleanSetting.hide_sensors]: {
    label: DeviceSetting.hideSensorsPanel,
    help: Content.HIDE_SENSORS_WIDGET,
    control: "toggle",
  },
  [BooleanSetting.enable_3d_electronics_box_top]: {
    label: DeviceSetting.enable3dElectronicsBox,
    help: Content.ENABLE_3D_ELECTRONICS_BOX_TOP,
    control: "toggle",
  },
  [BooleanSetting.enable_browser_speak]: {
    label: DeviceSetting.readSpeakLogsInBrowser,
    help: Content.BROWSER_SPEAK_LOGS,
    control: "toggle",
  },
  [BooleanSetting.discard_unsaved]: {
    label: DeviceSetting.discardUnsavedChanges,
    help: Content.DISCARD_UNSAVED_CHANGES,
    control: "toggle",
  },
  [BooleanSetting.disable_emergency_unlock_confirmation]: {
    label: DeviceSetting.confirmEmergencyUnlock,
    help: Content.EMERGENCY_UNLOCK_CONFIRM_CONFIG,
    control: "toggle",
    inverted: true,
  },
  [BooleanSetting.user_interface_read_only_mode]: {
    label: DeviceSetting.userInterfaceReadOnlyMode,
    help: Content.USER_INTERFACE_READ_ONLY_MODE,
    control: "toggle",
  },
  [BooleanSetting.dark_mode]: {
    label: DeviceSetting.darkMode,
    help: Content.DARK_MODE,
    control: "toggle",
  },
  [BooleanSetting.show_controls_overlay]: {
    label: DeviceSetting.showControlsOverlay,
    help: Content.SHOW_CONTROLS_OVERLAY,
    control: "toggle",
    requires3D: true,
  },
};

export const WEB_APP_NUMBER_SETTINGS: Record<
  string, PaletteSettingMetadata
> = {
  [NumericSetting.map_size_x]: {
    label: DeviceSetting.mapSize,
    englishName: "Map size X (mm)",
    help: Content.MAP_SIZE,
    control: "number",
    min: 0,
    step: 1,
  },
  [NumericSetting.map_size_y]: {
    label: DeviceSetting.mapSize,
    englishName: "Map size Y (mm)",
    help: Content.MAP_SIZE,
    control: "number",
    min: 0,
    step: 1,
  },
  [NumericSetting.bot_origin_quadrant]: {
    label: DeviceSetting.mapOrigin,
    help: Content.MAP_ORIGIN,
    control: "select",
    min: 1,
    max: 4,
    step: 1,
  },
  [NumericSetting.default_plant_depth]: {
    label: DeviceSetting.defaultPlantDepth,
    help: Content.DEFAULT_PLANT_DEPTH,
    control: "number",
    min: 0,
    step: 1,
  },
  [NumericSetting.beep_verbosity]: {
    label: DeviceSetting.browserFarmbotActivityBeep,
    help: Content.BROWSER_ACTIVITY_BEEP,
    control: "select",
    min: 0,
    max: 3,
    step: 1,
  },
  [NumericSetting.success_log]: {
    label: DeviceSetting.logFilterLevelSuccess,
    control: "toggle",
  },
  [NumericSetting.busy_log]: {
    label: DeviceSetting.logFilterLevelBusy,
    control: "toggle",
  },
  [NumericSetting.warn_log]: {
    label: DeviceSetting.logFilterLevelWarn,
    control: "toggle",
  },
  [NumericSetting.error_log]: {
    label: DeviceSetting.logFilterLevelError,
    control: "toggle",
  },
  [NumericSetting.info_log]: {
    label: DeviceSetting.logFilterLevelInfo,
    control: "toggle",
  },
  [NumericSetting.fun_log]: {
    label: DeviceSetting.logFilterLevelFun,
    control: "toggle",
  },
  [NumericSetting.debug_log]: {
    label: DeviceSetting.logFilterLevelDebug,
    control: "toggle",
  },
  [NumericSetting.assertion_log]: {
    label: DeviceSetting.logFilterLevelAssertion,
    control: "toggle",
  },
};

export const WEB_APP_STRING_SETTINGS: Record<
  string, PaletteSettingMetadata
> = {
  [StringSetting.landing_page]: {
    label: DeviceSetting.landingPage,
    help: Content.LANDING_PAGE,
    control: "select",
  },
};

export const FBOS_SETTINGS: Record<string, PaletteSettingMetadata> = {
  gantry_height: {
    label: DeviceSetting.gantryHeight,
    help: ToolTips.GANTRY_HEIGHT,
    control: "number",
  },
  safe_height: {
    label: DeviceSetting.safeHeight,
    help: ToolTips.SAFE_HEIGHT,
    control: "number",
  },
  soil_height: {
    label: DeviceSetting.fallbackSoilHeight,
    help: ToolTips.FALLBACK_SOIL_HEIGHT,
    control: "number",
  },
  default_axis_order: {
    label: DeviceSetting.defaultAxisOrder,
    help: ToolTips.DEFAULT_AXIS_ORDER,
    control: "select",
  },
  update_channel: {
    label: "OS release channel",
    control: "select",
  },
  sequence_init_log: {
    label: DeviceSetting.enableSequenceBeginLogs,
    help: ToolTips.SEQUENCE_LOG_BEGIN,
    control: "toggle",
  },
  sequence_body_log: {
    label: DeviceSetting.enableSequenceStepLogs,
    help: ToolTips.SEQUENCE_LOG_STEP,
    control: "toggle",
  },
  sequence_complete_log: {
    label: DeviceSetting.enableSequenceCompleteLogs,
    help: ToolTips.SEQUENCE_LOG_END,
    control: "toggle",
  },
};

export type FirmwareSettingVisibility =
  | "always"
  | "encoders"
  | "stall-future"
  | "tmc";

export type FirmwareValueTransform =
  | "none"
  | "movement-scale"
  | "microsteps"
  | "motor-current";

export interface FirmwareSettingMetadata extends PaletteSettingMetadata {
  keys: string[];
  visibility?: FirmwareSettingVisibility;
  transform?: FirmwareValueTransform;
  intSize?: "short" | "long";
  axis?: "x" | "y" | "z";
  stallLabel?: string;
  stallHelp?: string;
}

const xyzKeys = (base: string) =>
  ["x", "y", "z"].map(axis => `${base}_${axis}`);

export const FIRMWARE_SETTINGS: Record<
  string, FirmwareSettingMetadata
> = {
  movement_home_at_boot: {
    keys: xyzKeys("movement_home_at_boot"),
    label: DeviceSetting.findHomeOnBoot,
    help: ToolTips.FIND_HOME_ON_BOOT_ENCODERS,
    stallHelp: ToolTips.FIND_HOME_ON_BOOT_STALL_DETECTION,
    control: "axes",
  },
  movement_stop_at_home: {
    keys: xyzKeys("movement_stop_at_home"),
    label: DeviceSetting.stopAtHome,
    help: ToolTips.STOP_AT_HOME,
    control: "axes",
  },
  movement_stop_at_max: {
    keys: xyzKeys("movement_stop_at_max"),
    label: DeviceSetting.stopAtMax,
    help: ToolTips.STOP_AT_MAX,
    control: "axes",
  },
  movement_home_up: {
    keys: xyzKeys("movement_home_up"),
    label: DeviceSetting.negativeCoordinatesOnly,
    help: ToolTips.NEGATIVE_COORDINATES_ONLY,
    control: "axes",
  },
  movement_axis_nr_steps: {
    keys: xyzKeys("movement_axis_nr_steps"),
    label: DeviceSetting.axisLength,
    help: ToolTips.AXIS_LENGTH,
    control: "axes",
    transform: "movement-scale",
    intSize: "long",
  },
  movement_max_spd: {
    keys: xyzKeys("movement_max_spd"),
    label: DeviceSetting.maxSpeed,
    help: ToolTips.MAX_SPEED,
    control: "axes",
    transform: "movement-scale",
  },
  movement_max_spd_z2: {
    keys: ["movement_max_spd_z2"],
    label: DeviceSetting.maxSpeedTowardHome,
    help: ToolTips.MAX_SPEED_Z_TOWARD_HOME,
    control: "number",
    transform: "movement-scale",
    axis: "z",
  },
  movement_home_spd: {
    keys: xyzKeys("movement_home_spd"),
    label: DeviceSetting.homingSpeed,
    help: ToolTips.HOME_SPEED,
    control: "axes",
    transform: "movement-scale",
  },
  movement_min_spd: {
    keys: xyzKeys("movement_min_spd"),
    label: DeviceSetting.minimumSpeed,
    help: ToolTips.MIN_SPEED,
    control: "axes",
    transform: "movement-scale",
  },
  movement_min_spd_z2: {
    keys: ["movement_min_spd_z2"],
    label: DeviceSetting.minimumSpeedTowardHome,
    help: ToolTips.MIN_SPEED_Z_TOWARD_HOME,
    control: "number",
    transform: "movement-scale",
    axis: "z",
  },
  movement_steps_acc_dec: {
    keys: xyzKeys("movement_steps_acc_dec"),
    label: DeviceSetting.accelerateFor,
    help: ToolTips.ACCELERATE_FOR,
    control: "axes",
    transform: "movement-scale",
  },
  movement_steps_acc_dec_z2: {
    keys: ["movement_steps_acc_dec_z2"],
    label: DeviceSetting.accelerateForTowardHome,
    help: ToolTips.ACCELERATE_FOR_Z_TOWARD_HOME,
    control: "number",
    transform: "movement-scale",
    axis: "z",
  },
  movement_step_per_mm: {
    keys: xyzKeys("movement_step_per_mm"),
    label: DeviceSetting.stepsPerMm,
    help: ToolTips.STEPS_PER_MM,
    control: "axes",
    transform: "microsteps",
  },
  movement_microsteps: {
    keys: xyzKeys("movement_microsteps"),
    label: DeviceSetting.microstepsPerStep,
    help: ToolTips.MICROSTEPS_PER_STEP,
    control: "axes",
  },
  movement_keep_active: {
    keys: xyzKeys("movement_keep_active"),
    label: DeviceSetting.alwaysPowerMotors,
    help: ToolTips.ALWAYS_POWER_MOTORS,
    control: "axes",
  },
  movement_invert_motor: {
    keys: xyzKeys("movement_invert_motor"),
    label: DeviceSetting.invertMotors,
    help: ToolTips.INVERT_MOTORS,
    control: "axes",
  },
  movement_motor_current: {
    keys: xyzKeys("movement_motor_current"),
    label: DeviceSetting.motorCurrent,
    help: ToolTips.MOTOR_CURRENT,
    control: "axes",
    visibility: "tmc",
    transform: "motor-current",
    min: 0,
    max: 100,
  },
  movement_axis_stealth: {
    keys: xyzKeys("movement_axis_stealth"),
    label: DeviceSetting.quietMode,
    help: ToolTips.QUIET_MODE,
    control: "axes",
    visibility: "tmc",
  },
  movement_secondary_motor_x: {
    keys: ["movement_secondary_motor_x"],
    label: DeviceSetting.enable2ndXMotor,
    help: ToolTips.ENABLE_X2_MOTOR,
    control: "toggle",
  },
  movement_secondary_motor_invert_x: {
    keys: ["movement_secondary_motor_invert_x"],
    label: DeviceSetting.invert2ndXMotor,
    help: ToolTips.INVERT_X2_MOTOR,
    control: "toggle",
  },
  encoder_enabled: {
    keys: xyzKeys("encoder_enabled"),
    label: DeviceSetting.enableEncoders,
    stallLabel: DeviceSetting.enableStallDetection,
    help: ToolTips.ENABLE_ENCODERS,
    stallHelp: ToolTips.ENABLE_STALL_DETECTION,
    control: "axes",
  },
  movement_stall_sensitivity: {
    keys: xyzKeys("movement_stall_sensitivity"),
    label: DeviceSetting.stallSensitivity,
    help: ToolTips.STALL_SENSITIVITY,
    control: "axes",
    visibility: "stall-future",
    min: -63,
    max: 63,
  },
  encoder_use_for_pos: {
    keys: xyzKeys("encoder_use_for_pos"),
    label: DeviceSetting.useEncodersForPositioning,
    help: ToolTips.USE_ENCODERS_FOR_POSITIONING,
    control: "axes",
    visibility: "encoders",
  },
  encoder_invert: {
    keys: xyzKeys("encoder_invert"),
    label: DeviceSetting.invertEncoders,
    help: ToolTips.INVERT_ENCODERS,
    control: "axes",
    visibility: "encoders",
  },
  encoder_missed_steps_max: {
    keys: xyzKeys("encoder_missed_steps_max"),
    label: DeviceSetting.maxMissedSteps,
    stallLabel: DeviceSetting.maxMotorLoad,
    help: ToolTips.MAX_MISSED_STEPS_ENCODERS,
    stallHelp: ToolTips.MAX_MISSED_STEPS_STALL_DETECTION,
    control: "axes",
  },
  encoder_missed_steps_decay: {
    keys: xyzKeys("encoder_missed_steps_decay"),
    label: DeviceSetting.missedStepDecay,
    help: ToolTips.MISSED_STEP_DECAY_ENCODERS,
    control: "axes",
    visibility: "encoders",
  },
  encoder_scaling: {
    keys: xyzKeys("encoder_scaling"),
    label: DeviceSetting.encoderScaling,
    help: ToolTips.ENCODER_SCALING,
    control: "axes",
    visibility: "encoders",
    transform: "microsteps",
    intSize: "long",
  },
  movement_enable_endpoints: {
    keys: xyzKeys("movement_enable_endpoints"),
    label: DeviceSetting.enableLimitSwitches,
    help: ToolTips.ENABLE_LIMIT_SWITCHES,
    control: "axes",
  },
  movement_invert_endpoints: {
    keys: xyzKeys("movement_invert_endpoints"),
    label: DeviceSetting.swapLimitSwitches,
    help: ToolTips.SWAP_LIMIT_SWITCHES,
    control: "axes",
  },
  movement_invert_2_endpoints: {
    keys: xyzKeys("movement_invert_2_endpoints"),
    label: DeviceSetting.invertLimitSwitches,
    help: ToolTips.INVERT_LIMIT_SWITCHES,
    control: "axes",
  },
  param_mov_nr_retry: {
    keys: ["param_mov_nr_retry"],
    label: DeviceSetting.maxRetries,
    help: ToolTips.MAX_MOVEMENT_RETRIES,
    control: "number",
  },
  param_e_stop_on_mov_err: {
    keys: ["param_e_stop_on_mov_err"],
    label: DeviceSetting.estopOnMovementError,
    help: ToolTips.E_STOP_ON_MOV_ERR,
    control: "toggle",
  },
  movement_timeout: {
    keys: xyzKeys("movement_timeout"),
    label: DeviceSetting.timeoutAfter,
    help: ToolTips.TIMEOUT_AFTER,
    control: "axes",
  },
  movement_calibration_retry: {
    keys: xyzKeys("movement_calibration_retry"),
    label: DeviceSetting.calibrationRetries,
    help: ToolTips.CALIBRATION_RETRIES,
    control: "axes",
  },
  movement_calibration_retry_total: {
    keys: xyzKeys("movement_calibration_retry_total"),
    label: DeviceSetting.calibrationTotalRetries,
    help: ToolTips.CALIBRATION_TOTAL_RETRIES,
    control: "axes",
  },
  movement_calibration_deadzone: {
    keys: xyzKeys("movement_calibration_deadzone"),
    label: DeviceSetting.calibrationRetryResetDistance,
    help: ToolTips.CALIBRATION_RETRY_RESET_DISTANCE,
    control: "axes",
    transform: "movement-scale",
  },
};

export interface PinGuardSettingMetadata {
  label: string;
  pinKey: string;
  timeoutKey: string;
  activeStateKey: string;
  help: string;
}

export const PIN_GUARD_SETTINGS: PinGuardSettingMetadata[] =
  [1, 2, 3, 4, 5].map(index => ({
    label: DeviceSetting[
      `pinGuard${index}` as keyof typeof DeviceSetting
    ],
    pinKey: `pin_guard_${index}_pin_nr`,
    timeoutKey: `pin_guard_${index}_time_out`,
    activeStateKey: `pin_guard_${index}_active_state`,
    help: ToolTips.PIN_GUARD_PIN_NUMBER,
  }));

export interface ThreeDSettingMetadata extends PaletteSettingMetadata {
  key: string;
}

export const THREE_D_DEFAULTS: Partial<Record<keyof Config, number>> = {
  bedWallThickness: 40,
  bedHeight: 300,
  ccSupportSize: 50,
  beamLength: 1500,
  columnLength: 500,
  zAxisLength: 1000,
  bedXOffset: 150,
  bedYOffset: 20,
  bedZOffset: 0,
  legSize: 100,
  legsFlush: 1,
  extraLegsX: 1,
  extraLegsY: 0,
  bedBrightness: 8,
  soilBrightness: 12,
  clouds: 1,
  constellations: 1,
  constellationsDebug: 0,
  laser: 0,
  stats: 0,
  threeAxes: 0,
  solar: 0,
  lowDetail: 0,
  eventDebug: 0,
  cableDebug: 0,
  lightsDebug: 0,
  moistureDebug: 0,
  cameraFitDebug: 0,
  viewCube: 1,
  ground: 1,
  groundTexture: 0,
  surfaceDebug: SurfaceDebugOption.none,
  ambient: 75,
  sun: 75,
  heading: 0,
  sunAzimuth: 230,
  sunInclination: 140,
  bounds: 0,
  grid: 1,
  scene: 0,
  tracks: 1,
  cableCarriers: 1,
  axes: 0,
  xyDimensions: 0,
  zDimension: 0,
  people: 0,
};

export const THREE_D_SETTINGS: ThreeDSettingMetadata[] = [
  {
    key: "heading",
    label: DeviceSetting.heading,
    help: ToolTips.THREE_D_HEADING,
    control: "number",
  },
  {
    key: "scene",
    label: DeviceSetting.environment,
    help: ToolTips.THREE_D_ENVIRONMENT,
    control: "select",
  },
  {
    key: "groundTexture",
    label: DeviceSetting.groundTexture,
    help: ToolTips.THREE_D_GROUND_TEXTURE,
    control: "select",
  },
  {
    key: "bedWallThickness",
    label: DeviceSetting.bedWallThickness,
    help: ToolTips.THREE_D_BED_WALL_THICKNESS,
    control: "number",
  },
  {
    key: "bedHeight",
    label: DeviceSetting.bedHeight,
    help: ToolTips.THREE_D_BED_HEIGHT,
    control: "number",
  },
  {
    key: "ccSupportSize",
    label: DeviceSetting.ccSupportSize,
    help: ToolTips.THREE_D_CC_SUPPORT_SIZE,
    control: "number",
  },
  {
    key: "beamLength",
    label: DeviceSetting.beamLength,
    help: ToolTips.THREE_D_BEAM_LENGTH,
    control: "number",
  },
  {
    key: "columnLength",
    label: DeviceSetting.columnLength,
    help: ToolTips.THREE_D_COLUMN_LENGTH,
    control: "number",
  },
  {
    key: "zAxisLength",
    label: DeviceSetting.zAxisLength,
    help: ToolTips.THREE_D_Z_AXIS_LENGTH,
    control: "number",
  },
  {
    key: "bedXOffset",
    label: DeviceSetting.bedXOffset,
    help: ToolTips.THREE_D_BED_X_OFFSET,
    control: "number",
  },
  {
    key: "bedYOffset",
    label: DeviceSetting.bedYOffset,
    help: ToolTips.THREE_D_BED_Y_OFFSET,
    control: "number",
  },
  {
    key: "bedZOffset",
    label: DeviceSetting.bedZOffset,
    help: ToolTips.THREE_D_BED_Z_OFFSET,
    control: "number",
  },
  {
    key: "legSize",
    label: DeviceSetting.legSize,
    help: ToolTips.THREE_D_LEG_SIZE,
    control: "number",
  },
  {
    key: "bounds",
    label: DeviceSetting.bounds,
    help: ToolTips.THREE_D_BOUNDS,
    control: "toggle",
  },
  {
    key: "grid",
    label: DeviceSetting.grid,
    help: ToolTips.THREE_D_GRID,
    control: "toggle",
  },
];

export interface SettingsItemMetadata {
  id: string;
  label: DeviceSetting;
  help?: string;
}

export const SETTINGS_ITEMS: SettingsItemMetadata[] = [
  { id: "name", label: DeviceSetting.name },
  { id: "order-number", label: DeviceSetting.orderNumber },
  { id: "timezone", label: DeviceSetting.timezone },
  { id: "location", label: DeviceSetting.farmbotLocation },
  { id: "indoor", label: DeviceSetting.indoor },
  { id: "farmbot-os", label: DeviceSetting.farmbotOS },
  { id: "boot-sequence", label: DeviceSetting.bootSequence },
  { id: "firmware", label: DeviceSetting.firmware },
  { id: "flash-firmware", label: DeviceSetting.flashFirmware },
  { id: "firmware-path", label: DeviceSetting.firmwarePath },
  { id: "rpi-model", label: DeviceSetting.raspberryPiModel },
  {
    id: "soft-reset",
    label: DeviceSetting.softReset,
    help: Content.SOFT_RESET_WARNING,
  },
  {
    id: "hard-reset",
    label: DeviceSetting.hardReset,
    help: Content.HARD_RESET_WARNING,
  },
  {
    id: "set-axis-length",
    label: DeviceSetting.setAxisLength,
    help: ToolTips.SET_AXIS_LENGTH,
  },
  {
    id: "camera-start",
    label: DeviceSetting.setCameraStartingLocation,
    help: Content.CAMERA_STARTING_LOCATION,
  },
  {
    id: "parameter-load",
    label: DeviceSetting.paramLoadProgress,
    help: ToolTips.PARAMETER_LOAD_PROGRESS,
  },
  { id: "parameter-resend", label: DeviceSetting.paramResend },
  { id: "parameter-export", label: DeviceSetting.exportParameters },
  {
    id: "parameter-import",
    label: DeviceSetting.importParameters,
    help: ToolTips.PARAMETER_IMPORT,
  },
  {
    id: "parameter-reset",
    label: DeviceSetting.resetHardwareParams,
    help: Content.RESTORE_DEFAULT_HARDWARE_SETTINGS,
  },
  { id: "custom-settings", label: DeviceSetting.envEditor },
  {
    id: "stock-pin-bindings",
    label: DeviceSetting.stockPinBindings,
    help: ToolTips.PIN_BINDINGS,
  },
  { id: "saved-pin-bindings", label: DeviceSetting.savedPinBindings },
  { id: "add-pin-binding", label: DeviceSetting.addNewPinBinding },
  { id: "account-name", label: DeviceSetting.accountName },
  { id: "account-email", label: DeviceSetting.accountEmail },
  { id: "change-password", label: DeviceSetting.changePassword },
  { id: "language", label: DeviceSetting.language },
  {
    id: "reset-account",
    label: DeviceSetting.resetAccount,
    help: Content.ACCOUNT_RESET_WARNING,
  },
  {
    id: "delete-account",
    label: DeviceSetting.deleteAccount,
    help: Content.ACCOUNT_DELETE_WARNING,
  },
  {
    id: "export-account",
    label: DeviceSetting.exportAccountData,
    help: Content.EXPORT_DATA_DESC,
  },
  { id: "change-ownership", label: DeviceSetting.changeOwnership },
];

export const DIRECT_COMMAND_HELP: Record<string, string> = {
  "farmbot:estop": ToolTips.EMERGENCY_LOCK,
  "farmbot:photo": ToolTips.TAKE_PHOTO,
  "farmbot:calibrate-camera": ToolTips.CAMERA_CALIBRATION,
  "farmbot:detect-weeds": ToolTips.WEED_DETECTOR,
  "farmbot:measure-soil-height": ToolTips.SOIL_HEIGHT_DETECTION,
  "farmbot:reboot": Content.RESTART_FARMBOT,
  "farmbot:shutdown": Content.SHUTDOWN_FARMBOT,
  "farmbot:firmware-restart": Content.RESTART_FIRMWARE,
};
