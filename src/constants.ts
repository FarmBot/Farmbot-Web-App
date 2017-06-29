/**
 * Seems like a better idea to keep content and tooltips centralized. If we have
 * the ability to keep the app safer from possible accidental breakages by
 * avoiding going into components for copy changes, why not right? ¯\_(ツ)_/¯
 */

export namespace ToolTips {

  // Controls
  export const MOVE =
    `Use these manual control buttons to move FarmBot in realtime. Press the
    arrows for relative movements or type in new coordinates and press GO for an
    absolute movement. Tip: Press the Home button when you are done so FarmBot
    is ready to get back to work.`

  export const WEBCAM_SAVE =
    `Press the edit button to update and save your webcam URL.`

  export const PERIPHERALS =
    `Use these toggle switches to control FarmBot's peripherals in realtime. To
    edit and create new peripherals, press the EDIT button. Make sure to turn
    things off when you're done!`

  // Device
  export const OS_SETTINGS =
    `View and change device settings.`

  export const HW_SETTINGS =
    `Change settings of your FarmBot hardware with the fields below. Caution:
    Changing these settings to extreme values can cause hardware malfunction.
    Make sure to test any new settings before letting your FarmBot use them
    unsupervised. Tip: Recalibrate FarmBot after changing settings and test a
    few sequences to verify that everything works as expected. Note: Currently
    not all settings can be changed.`

  // Hardware Settings: Homing and Calibration
  export const HOMING =
    `(Alpha) If encoders or end-stops are enabled, home axis (find zero).`

  export const CALIBRATION =
    `(Alpha) If encoders or end-stops are enabled, home axis and determine
    maximum.`

  export const SET_ZERO_POSITION =
    `Set the current location as zero.`

  export const FIND_HOME_ON_BOOT =
    `If encoders or end-stops are enabled, find the home position when the
    device powers on.`

  export const STOP_AT_HOME =
    `Stop at the home location of the axis.`

  export const STOP_AT_MAX =
    `Don't allow movement past the maximum value provided in AXIS LENGTH.`

  export const NEGATIVE_COORDINATES_ONLY =
    `Restrict travel to negative coordinate locations. Overridden by disabling
    STOP AT HOME.`

  export const LENGTH =
    `Set the length of each axis to provide software limits. Used only if
    STOP AT MAX is enabled.`

  export const TIMEOUT_AFTER =
    `Amount of time to wait for a command to execute before stopping.`

  // Hardware Settings: Motors
  export const MAX_MOVEMENT_RETRIES =
    `Number of times to retry a movement before stopping.`

  export const MAX_SPEED =
    `Maximum travel speed after acceleration in motor steps per second.`

  export const MIN_SPEED =
    `Minimum movement speed. Also used for homing, calibration, and movements
    across home.`

  export const ACCELERATE_FOR =
    `Number of steps used for acceleration and deceleration.`

  export const STEPS_PER_MM =
    `The number of motor steps required to move the axis one millimeter.`

  export const ALWAYS_POWER_MOTORS =
    `Keep power applied to motors. Prevents slipping from gravity in certain
    situations.`

  export const INVERT_MOTORS =
    `Invert direction of motor during calibration.`

  export const ENABLE_X2_MOTOR =
    `Enable use of a second x-axis motor. Connects to E0 on RAMPS.`

  // Hardware Settings: Encoders and Endstops
  export const ENABLE_ENCODERS =
    `(Alpha) Enable use of rotary encoders during calibration and homing.`

  export const ENCODER_POSITIONING =
    `[EXPERIMENTAL] Use encoders for positioning.`

  export const INVERT_ENCODERS =
    `(Alpha) Reverse the direction of encoder position reading.`

  export const MAX_MISSED_STEPS =
    `(Alpha) Number of steps missed (determined by encoder) before motor is
    considered to have stalled.`

  export const ENCODER_MISSED_STEP_DECAY =
    `(Alpha) Reduction to missed step total for every good step.`

  export const ENCODER_SCALING =
    `(Alpha) encoder scaling factor = 100 * (motor resolution * microsteps) /
    (encoder resolution)`

  export const ENABLE_ENDSTOPS =
    `Enable use of electronic end-stops during calibration and homing.`

  export const INVERT_ENDPOINTS =
    `Swap axis end-stops during calibration.`

  // Farmware
  export const FARMWARE =
    `Manage Farmware (plugins).`

  export const PHOTOS =
    `Take and view photos with your FarmBot's camera.`

  export const WEED_DETECTOR =
    `Detect weeds using FarmBot's camera and display them on the Farm Designer
    map.`

  export const CAMERA_CALIBRATION =
    `Calibrate FarmBot's camera for use in the weed detection software.`

  // Sequences
  export const SEQUENCE_COMMANDS =
    `These are the most basic commands FarmBot can execute. Drag and drop them
    to create sequences for watering, planting seeds, measuring soil properties,
    and more.`

  export const SEQUENCE_EDITOR =
    `Drag and drop commands here to create sequences for watering, planting
    seeds, measuring soil properties, and more. Press the Test button to
    immediately try your sequence with FarmBot. You can also edit, copy, and
    delete existing sequences; assign a color; and give your commands custom
    names.`

  export const SEQUENCE_LIST =
    `Here is the list of all of your sequences. Click one to edit.`

  export const MOVE_ABSOLUTE =
    `The Move Absolute step instructs FarmBot to move to the specified
    coordinate regardless of the current position. For example, if FarmBot is
    currently at X=1000, Y=1000 and it receives a Move Absolute where X=0 and
    Y=3000, then FarmBot will move to X=0, Y=3000. If FarmBot must move in
    multiple directions, it will move diagonally. If you require straight
    movements along one axis at a time, use multiple Move Absolute steps.
    Offsets allow you to more easily instruct FarmBot to move to a location,
    but offset from it by the specified amount. For example moving to just
    above where a peripheral is located. Using offsets lets FarmBot do the
    math for you.`

  export const MOVE_RELATIVE =
    `The Move Relative step instructs FarmBot to move the specified distance
    from its current location. For example, if FarmBot is currently at X=1000,
    Y=1000 and it receives a Move Relative where X=0 and Y=3000, then FarmBot
    will move to X=1000, Y=4000. If FarmBot must move in multiple directions,
    it will move diagonally. If you require straight movements along one axis
    at a time, use  multiple Move Relative steps. Move Relative steps should be
    preceded by a Move Absolute step to ensure you are starting from a known
    location.`

  export const WRITE_PIN =
    `The Write Pin step instructs FarmBot to set the specified pin on the
    Arduino to the specified mode and value. A Pin Mode of 0 is for on/off
    control, while a Pin Mode of 1 is for PWM (pulse width modulation) (0-255).`

  export const READ_PIN =
    `The Read Pin step instructs FarmBot to read the current value of the
    specified pin. A Pin Mode of 0 is for digital (on/off), while a Pin Mode
    of 1 is for analog (0-1023 for 0-5V).`

  export const WAIT =
    `The Wait step instructs FarmBot to wait for the specified amount of time.
    Use it in combination with the Pin Write step to water for a length of
    time.`

  export const SEND_MESSAGE =
    `The Send Message step instructs FarmBot to send a custom message to the
    logs (and toast message and/or email, if selected). This can help you with
    debugging your sequences.`

  export const FIND_HOME =
    `The Find Home step instructs the device to perform a homing command to
    find and set zero for the chosen axis or axes.`

  export const IF =
    `Execute a sequence if a condition is satisfied. If the condition is not
    satisfied, chose to do nothing or execute a different sequence.`

  export const EXECUTE_SCRIPT =
    `The Run Farmware step runs a Farmware package. The weed detection script
    is the only script supported at the moment, but user definable script
    support is coming soon!`

  export const TAKE_PHOTO =
    `Snaps a photo using the device camera. Select the camera type on the
    Device page.`

  // Regimens
  export const BULK_SCHEDULER =
    `Add sequences to your regimen by selecting a sequence from the drop down,
    specifying a time, choosing which days it should run on, and then clicking
    the + button. For example: a Seeding sequence might be scheduled for Day 1,
    while a Watering sequence would be scheduled to run every other day.`

  export const REGIMEN_EDITOR =
    `Regimens allow FarmBot to take care of a plant throughout its entire life.
    A regimen consists of many sequences that are scheduled to run based on the
    age of the plant. Regimens are applied to plants from the farm designer
    (coming soon) and can be re-used on many plants growing at the same or
    different times. Multiple regimens can be applied to any one plant.`

  export const REGIMEN_LIST =
    `This is a list of all of your regimens. Click one to begin editing it.`

  // Tools
  export const TOOL_LIST =
    `This is a list of all your FarmBot Tools. Click the Edit button to add,
    edit, or delete tools.`

  export const TOOLBAY_LIST =
    `Toolbays are where you store your FarmBot Tools. Each Toolbay has Slots
    that you can put your Tools in, which should be reflective of your real
    FarmBot hardware configuration.`

}

export namespace Content {

  // Account
  export const ACCOUNT_DELETE_WARNING =
    `WARNING! Deleting your account will permanently delete all of your
    Sequences , Regimens, Events, and Farm Designer data.Upon deleting your
    account, FarmBot will cease to function and become inaccessible until it is
    paired with another web app account. To do this, you will need to reboot
    your FarmBot so that is goes back into configuration mode for pairing with
    another user account. When this happens, all of the data on your FarmBot
    will be overwritten with the new account's data. If the account is brand
    new, then FarmBot will become a blank slate.`

  // Controls
  export const FACTORY_RESET_WARNING =
    `Factory resetting your FarmBot will destroy all data on the device,
    revoking your FarmBot's abilily to connect to your web app account and your
    home wifi. Upon factory resetting, your device will restart into
    Configurator mode. Factory resetting your FarmBot will not affect any data
    or settings from your web app account, allowing you to do a complete restore
    to your device once it is back online and paired with your web app account.`

}

export namespace Actions {

  // Resources
  export const DESTROY_RESOURCE_OK = `DESTROY_RESOURCE_OK`
  export const INIT_RESOURCE = `INIT_RESOURCE`
  export const SAVE_SPECIAL_RESOURCE = `SAVE_SPECIAL_RESOURCE`
  export const SAVE_RESOURCE_OK = `SAVE_RESOURCE_OK`
  export const UPDATE_RESOURCE_OK = `UPDATE_RESOURCE_OK`
  export const EDIT_RESOURCE = `EDIT_RESOURCE`
  export const OVERWRITE_RESOURCE = `OVERWRITE_RESOURCE`
  export const SAVE_RESOURCE_START = `SAVE_RESOURCE_START`
  export const RESOURCE_READY = `RESOURCE_READY`

  // Auth
  export const LOGIN_OK = `LOGIN_OK`

  // Config
  export const CHANGE_API_PORT = `CHANGE_API_PORT`
  export const CHANGE_API_HOST = `CHANGE_API_HOST`

  // Devices
  export const TOGGLE_CONTROL_PANEL_OPTION = `TOGGLE_CONTROL_PANEL_OPTION`
  export const CHANGE_STEP_SIZE = `CHANGE_STEP_SIZE`
  export const SETTING_UPDATE_START = `SETTING_UPDATE_START`
  export const SETTING_UPDATE_END = `SETTING_UPDATE_END`
  export const BOT_CHANGE = `BOT_CHANGE`
  export const FETCH_OS_UPDATE_INFO_OK = `FETCH_OS_UPDATE_INFO_OK`
  export const FETCH_FW_UPDATE_INFO_OK = `FETCH_FW_UPDATE_INFO_OK`
  export const SET_SYNC_STATUS = `SET_SYNC_STATUS`
  export const INVERT_JOG_BUTTON = `INVERT_JOG_BUTTON`

  // Draggable
  export const PUT_DATA_XFER = `PUT_DATA_XFER`
  export const DROP_DATA_XFER = `DROP_DATA_XFER`

  // Designer
  export const SEARCH_QUERY_CHANGE = `SEARCH_QUERY_CHANGE`
  export const SELECT_PLANT = `SELECT_PLANT`
  export const TOGGLE_HOVERED_PLANT = `TOGGLE_HOVERED_PLANT`
  export const UPDATE_BOT_ORIGIN_QUADRANT = `UPDATE_BOT_ORIGIN_QUADRANT`
  export const UPDATE_MAP_ZOOM_LEVEL = `UPDATE_MAP_ZOOM_LEVEL`
  export const OF_SEARCH_RESULTS_OK = `OF_SEARCH_RESULTS_OK`

  // Regimens
  export const PUSH_WEEK = `PUSH_WEEK`
  export const POP_WEEK = `POP_WEEK`
  export const TOGGLE_DAY = `TOGGLE_DAY`
  export const SELECT_REGIMEN = `SELECT_REGIMEN`
  export const SET_SEQUENCE = `SET_SEQUENCE`
  export const SET_TIME_OFFSET = `SET_TIME_OFFSET`

  // Sequences
  export const SELECT_SEQUENCE = `SELECT_SEQUENCE`

  // Farmware
  export const SELECT_IMAGE = `SELECT_IMAGE`

}
