import { trim } from "./util";

export namespace ToolTips {

  // Controls
  export const MOVE =
    trim(`Use these manual control buttons to move FarmBot in realtime. Press the
    arrows for relative movements or type in new coordinates and press GO for an
    absolute movement. Tip: Press the Home button when you are done so FarmBot
    is ready to get back to work.`);

  export const WEBCAM =
    trim(`If you have a webcam, you can view the video stream in this widget.
    Press the edit button to update and save your webcam URL.`);

  export const PERIPHERALS =
    trim(`Use these toggle switches to control FarmBot's peripherals in realtime.
    To edit and create new peripherals, press the EDIT button. Make sure to turn
    things off when you're done!`);

  export const SENSORS =
    trim(`Add sensors here to monitor FarmBot's sensors.
    To edit and create new sensors, press the EDIT button.`);

  // Device
  export const OS_SETTINGS =
    trim(`View and change device settings.`);

  export const HW_SETTINGS =
    trim(`Change settings of your FarmBot hardware with the fields below. Caution:
    Changing these settings to extreme values can cause hardware malfunction.
    Make sure to test any new settings before letting your FarmBot use them
    unsupervised. Tip: Recalibrate FarmBot after changing settings and test a
    few sequences to verify that everything works as expected.`);

  export const PIN_BINDINGS =
    trim(`Assign a sequence to execute when a Raspberry Pi GPIO pin is activated.`);

  // Connectivity
  export const CONNECTIVITY =
    trim(`Diagnose connectivity issues with FarmBot and the browser.`);

  // Hardware Settings: Homing and Calibration
  export const HOMING =
    trim(`(Alpha) If encoders or end-stops are enabled, home axis (find zero).`);

  export const CALIBRATION =
    trim(`(Alpha) If encoders or end-stops are enabled, home axis and determine
    maximum.`);

  export const SET_ZERO_POSITION =
    trim(`Set the current location as zero.`);

  export const FIND_HOME_ON_BOOT =
    trim(`If encoders or end-stops are enabled, find the home position when the
    device powers on. Warning! This will perform homing on all axes when the
    device powers on. Encoders or endstops must be enabled. It is recommended
    to make sure homing works properly before enabling this feature.`);

  export const STOP_AT_HOME =
    trim(`Stop at the home location of the axis.`);

  export const STOP_AT_MAX =
    trim(`Don't allow movement past the maximum value provided in AXIS LENGTH.`);

  export const NEGATIVE_COORDINATES_ONLY =
    trim(`Restrict travel to negative coordinate locations. Overridden by
    disabling STOP AT HOME.`);

  export const LENGTH =
    trim(`Set the length of each axis to provide software limits. Used only if
    STOP AT MAX is enabled.`);

  export const TIMEOUT_AFTER =
    trim(`Amount of time to wait for a command to execute before stopping.`);

  // Hardware Settings: Motors
  export const MAX_MOVEMENT_RETRIES =
    trim(`Number of times to retry a movement before stopping.`);

  export const E_STOP_ON_MOV_ERR =
    trim(`Emergency stop if movement is not complete after the maximum number of
    retries.`);

  export const MAX_SPEED =
    trim(`Maximum travel speed after acceleration in motor steps per second.`);

  export const HOME_SPEED =
    trim(`Home position adjustment travel speed (homing and calibration)
    in motor steps per second.`);

  export const MIN_SPEED =
    trim(`Minimum movement speed in motor steps per second. Also used for homing
     and calibration.`);

  export const ACCELERATE_FOR =
    trim(`Number of steps used for acceleration and deceleration.`);

  export const STEPS_PER_MM =
    trim(`The number of motor steps required to move the axis one millimeter.`);

  export const ALWAYS_POWER_MOTORS =
    trim(`Keep power applied to motors. Prevents slipping from gravity in certain
    situations.`);

  export const INVERT_MOTORS =
    trim(`Invert direction of motor during calibration.`);

  export const ENABLE_X2_MOTOR =
    trim(`Enable use of a second x-axis motor. Connects to E0 on RAMPS.`);

  // Hardware Settings: Encoders and Endstops
  export const ENABLE_ENCODERS =
    trim(`(Alpha) Enable use of rotary encoders during calibration and homing.`);

  export const ENCODER_POSITIONING =
    trim(`[EXPERIMENTAL] Use encoders for positioning.`);

  export const INVERT_ENCODERS =
    trim(`(Alpha) Reverse the direction of encoder position reading.`);

  export const MAX_MISSED_STEPS =
    trim(`(Alpha) Number of steps missed (determined by encoder) before motor is
    considered to have stalled.`);

  export const ENCODER_MISSED_STEP_DECAY =
    trim(`(Alpha) Reduction to missed step total for every good step.`);

  export const ENCODER_SCALING =
    trim(`(Alpha) encoder scaling factor = 10000 * (motor resolution * microsteps)
    / (encoder resolution).`);

  export const ENABLE_ENDSTOPS =
    trim(`Enable use of electronic end-stops during calibration and homing.`);

  export const SWAP_ENDPOINTS =
    trim(`Swap axis minimum and maximum end-stops.`);

  export const INVERT_ENDPOINTS =
    trim(`Invert axis end-stops. Enable for normally closed (NC),
    disable for normally open (NO).`);

  // Hardware Settings: Pin Guard
  export const PIN_GUARD_PIN_NUMBER =
    trim(`The number of the pin to guard. This pin will be set to the specified
    state after the duration specified by TIMEOUT.`);

  // Farmware
  export const FARMWARE =
    trim(`Manage Farmware (plugins).`);

  export const FARMWARE_LIST =
    trim(`View, select, and install new Farmware.`);

  export const FARMWARE_INFO =
    trim(`Farmware (plugin) details and management.`);

  export const PHOTOS =
    trim(`Take and view photos with your FarmBot's camera.`);

  export const WEED_DETECTOR =
    trim(`Detect weeds using FarmBot's camera and display them on the
    Farm Designer map.`);

  export const CAMERA_CALIBRATION =
    trim(`Calibrate FarmBot's camera for use in the weed detection software.`);

  // Sequences
  export const SEQUENCE_COMMANDS =
    trim(`These are the most basic commands FarmBot can execute. Drag and drop
    them to create sequences for watering, planting seeds, measuring soil
    properties, and more.`);

  export const SEQUENCE_EDITOR =
    trim(`Drag and drop commands here to create sequences for watering, planting
    seeds, measuring soil properties, and more. Press the Test button to
    immediately try your sequence with FarmBot. You can also edit, copy, and
    delete existing sequences; assign a color; and give your commands custom
    names.`);

  export const SEQUENCE_LIST =
    trim(`Here is the list of all of your sequences. Click one to edit.`);

  export const MOVE_ABSOLUTE =
    trim(`The Move Absolute step instructs FarmBot to move to the specified
    coordinate regardless of the current position. For example, if FarmBot is
    currently at X=1000, Y=1000 and it receives a Move Absolute where X=0 and
    Y=3000, then FarmBot will move to X=0, Y=3000. If FarmBot must move in
    multiple directions, it will move diagonally. If you require straight
    movements along one axis at a time, use multiple Move Absolute steps.
    Offsets allow you to more easily instruct FarmBot to move to a location,
    but offset from it by the specified amount. For example moving to just
    above where a peripheral is located. Using offsets lets FarmBot do the
    math for you.`);

  export const MOVE_RELATIVE =
    trim(`The Move Relative step instructs FarmBot to move the specified distance
    from its current location. For example, if FarmBot is currently at X=1000,
    Y=1000 and it receives a Move Relative where X=0 and Y=3000, then FarmBot
    will move to X=1000, Y=4000. If FarmBot must move in multiple directions,
    it will move diagonally. If you require straight movements along one axis
    at a time, use  multiple Move Relative steps. Move Relative steps should be
    preceded by a Move Absolute step to ensure you are starting from a known
    location.`);

  export const WRITE_PIN =
    trim(`The Write Pin step instructs FarmBot to set the specified pin on the
    Arduino to the specified mode and value. Use the digital pin mode for
    on (1) and off (0) control, and analog pin mode for PWM (pulse width
    modulation) (0-255).`);

  export const READ_PIN =
    trim(`The Read Pin step instructs FarmBot to read the current value of the
    specified pin. Pin Mode: Use digital for a 0 (LOW) or 1 (HIGH) response,
    and analog for a voltage reading (0-1023 for 0-5V).`);

  export const WAIT =
    trim(`The Wait step instructs FarmBot to wait for the specified amount
    of time. Use it in combination with the Pin Write step to water for a
    length of time.`);

  export const SEND_MESSAGE =
    trim(`The Send Message step instructs FarmBot to send a custom message
    to the logs (and toast message and/or email, if selected). This can
    help you with debugging your sequences.`);

  export const FIND_HOME =
    trim(`The Find Home step instructs the device to perform a homing
    command to find and set zero for the chosen axis or axes.`);

  export const IF =
    trim(`Execute a sequence if a condition is satisfied. If the condition
    is not satisfied, chose to do nothing or execute a different sequence.`);

  export const EXECUTE_SEQUENCE =
    trim(`Executes another sequence.`);

  export const EXECUTE_SCRIPT =
    trim(`The Run Farmware step runs a Farmware package.
   Visit the Farmware page to install and manage Farmware.`);

  export const FARMWARE_CONFIGS =
    trim(`The Farmware will use the parameter values set via the Farmware page
    for any parameters that are not set in this sequence step.`);

  export const TAKE_PHOTO =
    trim(`Snaps a photo using the device camera. Select the camera type on the
    Device page.`);

  // Regimens
  export const BULK_SCHEDULER =
    trim(`Add sequences to your regimen by selecting a sequence from the
    drop down, specifying a time, choosing which days it should run on,
    and then clicking the + button. For example: a Seeding sequence might
    be scheduled for Day 1, while a Watering sequence would be scheduled
    to run every other day.`);

  export const REGIMEN_EDITOR =
    trim(`Regimens allow FarmBot to take care of a plant throughout its
    entire life. A regimen consists of many sequences that are scheduled
    to run based on the age of the plant. Regimens are applied to plants
    from the farm designer (coming soon) and can be re-used on many plants
    growing at the same or different times. Multiple regimens can be
    applied to any one plant.`);

  export const REGIMEN_LIST =
    trim(`This is a list of all of your regimens. Click one to begin
    editing it.`);

  // Tools
  export const TOOL_LIST =
    trim(`This is a list of all your FarmBot Tools. Click the Edit button
    to add, edit, or delete tools.`);

  export const TOOLBAY_LIST =
    trim(`Toolbays are where you store your FarmBot Tools. Each Toolbay
    has Slots that you can put your Tools in, which should be reflective
    of your real FarmBot hardware configuration.`);

  // Logs
  export const LOGS =
    trim(`View and filter log messages.`);

  export const SEQUENCE_LOG_BEGIN =
    trim(`Send a log message upon the start of sequence execution.`);

  export const SEQUENCE_LOG_STEP =
    trim(`Send a log message for each sequence step.`);

  export const SEQUENCE_LOG_END =
    trim(`Send a log message upon the end of sequence execution.`);

  export const FIRMWARE_LOG_SENT =
    trim(`Log all commands sent to firmware (clears after refresh).`);

  export const FIRMWARE_LOG_RECEIVED =
    trim(`Log all responses received from firmware (clears after refresh).
    Warning: extremely verbose.`);

  export const FIRMWARE_DEBUG_MESSAGES =
    trim(`Log all debug received from firmware (clears after refresh).`);

  // App
  export const LABS =
    trim(`Customize your web app experience.`);
}

export namespace Content {

  // Account
  export const ACCOUNT_PASSWORD_CHANGE =
    trim(`Upon successful password change, your FarmBot will factory reset
    allowing you to configure it with the updated credentials. You will also be
    logged out of other browser sessions. Continue?`);

  export const ACCOUNT_DELETE_WARNING =
    trim(`WARNING! Deleting your account will permanently delete all of your
    Sequences , Regimens, Events, and Farm Designer data.Upon deleting your
    account, FarmBot will cease to function and become inaccessible until it is
    paired with another web app account. To do this, you will need to reboot
    your FarmBot so that is goes back into configuration mode for pairing with
    another user account. When this happens, all of the data on your FarmBot
    will be overwritten with the new account's data. If the account is brand
    new, then FarmBot will become a blank slate.`);

  export const TYPE_PASSWORD_TO_DELETE =
    trim(`If you are sure you want to delete your account, type in
    your password below to continue.`);

  export const EXPORT_DATA_DESC =
    trim(`Export all data related to this device. Exports are delivered via
    email as JSON.`);

  export const EXPORT_SENT =
    trim(`Export request received. Please allow up to 10 minutes for
    delivery.`);
  // App Settings
  export const CONFIRM_STEP_DELETION =
    trim(`Show a confirmation dialog when the sequence delete step
    icon is pressed.`);

  export const HIDE_WEBCAM_WIDGET =
    trim(`If not using a webcam, use this setting to remove the
    widget from the Controls page.`);

  export const DYNAMIC_MAP_SIZE =
    trim(`Change the Farm Designer map size based on axis length.
    A value must be input in AXIS LENGTH and STOP AT MAX must be enabled in
    the HARDWARE widget.`);

  export const DOUBLE_MAP_DIMENSIONS =
    trim(`Double the default dimensions of the Farm Designer map
    for a map with four times the area.`);

  export const PLANT_ANIMATIONS =
    trim(`Enable plant animations in the Farm Designer.`);

  export const BROWSER_SPEAK_LOGS =
    trim(`Have the browser also read aloud log messages on the
    "Speak" channel that are spoken by FarmBot.`);

  export const DISCARD_UNSAVED_CHANGES =
    trim(`Don't ask about saving work before
    closing browser tab. Warning: may cause loss of data.`);

  export const DISCARD_UNSAVED_CHANGES_CONFIRM =
    trim(`Warning! When enabled, any unsaved changes
    will be discarded when refreshing or closing the page. Are you sure?`);

  export const VIRTUAL_TRAIL =
    trim(`Display a virtual trail for FarmBot in the Farm Designer map to show
    movement and watering history while the map is open. Toggling this setting
    will clear data for the current trail.`);

  // Device
  export const NOT_HTTPS =
    trim(`WARNING: Sending passwords via HTTP:// is not secure.`);

  export const CONTACT_SYSADMIN =
    trim(`Please contact the system(s) administrator(s) and ask them to enable
    HTTPS://`);

  export const FACTORY_RESET_WARNING =
    trim(`Factory resetting your FarmBot will destroy all data on the device,
    revoking your FarmBot's abilily to connect to your web app account and your
    home wifi. Upon factory resetting, your device will restart into
    Configurator mode. Factory resetting your FarmBot will not affect any data
    or settings from your web app account, allowing you to do a complete restore
    to your device once it is back online and paired with your web app
    account.`);

  export const FACTORY_RESET_ALERT =
    trim(`Warning: This will erase all data stored on your FarmBot's SD card,
    requiring you to reconfigure FarmBot so that it can reconnect to your
    WiFi network and a web app account. Factory resetting the device will
    not delete data stored in your web app account. Are you sure you wish
    to continue?`);

  export const MCU_RESET_ALERT =
    trim(`Warning: This will reset all hardware settings to the default values.
    Are you sure you wish to continue?`);

  export const AUTO_FACTORY_RESET =
    trim(`Automatically factory reset when the WiFi network cannot be
    detected. Useful for network changes.`);

  export const AUTO_FACTORY_RESET_PERIOD =
    trim(`Time in minutes to attempt connecting to WiFi before a factory
    reset.`);

  export const TIMEZONE_GUESS_BROWSER =
    trim(`This account did not have a timezone set. Farmbot requires a
    timezone to operate. We have updated your timezone settings based on
    your browser. Please verify these settings in the device settings panel.
    Device sync is recommended.`);

  export const TIMEZONE_GUESS_UTC =
    trim(`Warning: Farmbot could not guess your timezone. We have defaulted
    your timezone to UTC, which is less than ideal for most users. Please
    select your timezone from the dropdown. Device sync is recommended.`);

  export const DIFFERENT_TZ_WARNING =
    trim(`Note: The selected timezone for your FarmBot is different than
    your local browser time.`);

  export const RESTART_FARMBOT =
    trim(`This will restart FarmBot's Raspberry Pi and controller
    software.`);

  export const OS_AUTO_UPDATE =
    trim(`When enabled, FarmBot OS will periodically check for, download,
    and install updates automatically.`);

  export const AUTO_SYNC =
    trim(`When enabled, device resources such as sequences and regimens
    will be sent to the device automatically. This removes the need to push
    "SYNC" after making changes in the web app. Changes to running
    sequences and regimens while auto sync is enabled will result in
    instantaneous change.`);

  export const SHUTDOWN_FARMBOT =
    trim(`This will shutdown FarmBot's Raspberry Pi. To turn it
    back on, unplug FarmBot and plug it back in.`);

  export const OS_BETA_RELEASES =
    trim(`Warning! Opting in to FarmBot OS beta releases may reduce
    FarmBot system stability. Are you sure?`);

  // Hardware Settings
  export const RESTORE_DEFAULT_HARDWARE_SETTINGS =
    trim(`Restoring hardware parameter defaults will destroy the
    current settings, resetting them to default values.`);

  // App
  export const APP_LOAD_TIMEOUT_MESSAGE =
    trim(`App could not be fully loaded, we recommend you try
    refreshing the page.`);

  export const MQTT_DISCONNECTED =
    trim(`Your web browser is unable to connect to the message broker.
    You might be behind a firewall or disconnected from the Internet. Check
    your network settings.
    View Device > Connectivity for more details.`);

  export const MALFORMED_MESSAGE_REC_UPGRADE =
    trim(`FarmBot sent a malformed message. You may need to upgrade
    FarmBot OS. Please upgrade FarmBot OS and log back in.`);

  export const OLD_FBOS_REC_UPGRADE = trim(`Your version of FarmBot OS is
    outdated and will soon no longer be supported. Please update your device as
    soon as possible.`);

  export const EXPERIMENTAL_WARNING =
    trim(`Warning! This is an EXPERIMENTAL feature. This feature may be
    broken and may break or otherwise hinder your usage of the rest of the
    app. This feature may disappear or break at any time.`);

  // Front Page
  export const TOS_UPDATE =
    trim(`The terms of service have recently changed. You must accept the
    new terms of service to continue using the site.`);

  // Sequences
  export const NO_SEQUENCE_SELECTED =
    trim(`No Sequence selected. Click one in the Sequences panel to edit,
    or click "+" to create a new one.`);

  export const END_DETECTION_DISABLED =
    trim(`This command will not execute correctly because you do not have
    encoders or endstops enabled for the chosen axis. Enable endstops or
    encoders from the Device page for: `);

  export const IN_USE =
    trim(`Used in another resource. Protected from deletion.`);

  // Regimens
  export const NO_REGIMEN_SELECTED =
    trim(`No Regimen selected. Click one in the Regimens panel to edit, or
    click "+" in the Regimens panel to create a new one.`);

  // Farm Designer
  export const OUTSIDE_PLANTING_AREA =
    trim(`Outside of planting area. Plants must be placed within the grid.`);

  // Farm Events
  export const REGIMEN_TODAY_SKIPPED_ITEM_RISK =
    trim(`You are scheduling a regimen to run today. Be aware that
    running a regimen too late in the day may result in skipped
    regimen tasks. Consider rescheduling this event to tomorrow if
    this is a concern.`);

  export const INVALID_RUN_TIME =
    trim(`This Farm Event does not appear to have a valid run time.
    Perhaps you entered bad dates?`);

  export const FARM_EVENT_TZ_WARNING =
    trim(`Note: Times displayed according to FarmBot's local time, which
    is currently different from your browser's time. Timezone data is
    configurable on the Device page).`);

  export const FIRST_PARTY_WARNING =
    trim(`Are you sure you want to delete this first party farmware?
    Doing so will limit the functionality of your FarmBot and
    may cause unexpected behavior.`);

  export const SET_TIMEZONE_HEADER =
    trim(`You must set a timezone before using the FarmEvent feature.`);

  export const SET_TIMEZONE_BODY =
    trim(`Set device timezone here.`);

  // Farmware
  export const NO_IMAGES_YET =
    trim(`You haven't yet taken any photos with your FarmBot.
    Once you do, they will show up here.`);

  export const PROCESSING_PHOTO =
    trim(`Processing now. Results usually available in one minute.`);

  export const NOT_AVAILABLE_WHEN_OFFLINE =
    trim(`Not available when device is offline.`);
}

export enum Actions {

  // Resources
  DESTROY_RESOURCE_OK = "DESTROY_RESOURCE_OK",
  INIT_RESOURCE = "INIT_RESOURCE",
  BATCH_INIT = "BATCH_INIT",
  SAVE_RESOURCE_OK = "SAVE_RESOURCE_OK",
  UPDATE_RESOURCE_OK = "UPDATE_RESOURCE_OK",
  EDIT_RESOURCE = "EDIT_RESOURCE",
  OVERWRITE_RESOURCE = "OVERWRITE_RESOURCE",
  SAVE_RESOURCE_START = "SAVE_RESOURCE_START",
  RESOURCE_READY = "RESOURCE_READY",
  _RESOURCE_NO = "_RESOURCE_NO",
  REFRESH_RESOURCE_START = "REFRESH_RESOURCE_START",
  REFRESH_RESOURCE_OK = "REFRESH_RESOURCE_OK",
  REFRESH_RESOURCE_NO = "REFRESH_RESOURCE_NO",

  // Auth
  REPLACE_TOKEN = "REPLACE_TOKEN",
  LOGIN_ERROR = "LOGIN_ERR",

  // Config
  CHANGE_API_PORT = "CHANGE_API_PORT",
  CHANGE_API_HOST = "CHANGE_API_HOST",
  LOGOUT = "LOGOUT",

  // Devices
  TOGGLE_CONTROL_PANEL_OPTION = "TOGGLE_CONTROL_PANEL_OPTION",
  BULK_TOGGLE_CONTROL_PANEL = "BULK_TOGGLE_CONTROL_PANEL",
  CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE",
  SETTING_UPDATE_START = "SETTING_UPDATE_START",
  SETTING_UPDATE_END = "SETTING_UPDATE_END",
  BOT_CHANGE = "BOT_CHANGE",
  FETCH_OS_UPDATE_INFO_OK = "FETCH_OS_UPDATE_INFO_OK",
  FETCH_BETA_OS_UPDATE_INFO_OK = "FETCH_BETA_OS_UPDATE_INFO_OK",
  FETCH_MIN_OS_FEATURE_INFO_OK = "FETCH_MIN_OS_FEATURE_INFO_OK",
  INVERT_JOG_BUTTON = "INVERT_JOG_BUTTON",
  DISPLAY_ENCODER_DATA = "DISPLAY_ENCODER_DATA",
  STASH_STATUS = "STASH_STATUS",

  // Draggable
  PUT_DATA_XFER = "PUT_DATA_XFER",
  DROP_DATA_XFER = "DROP_DATA_XFER",

  // Designer
  SEARCH_QUERY_CHANGE = "SEARCH_QUERY_CHANGE",
  SELECT_PLANT = "SELECT_PLANT",
  TOGGLE_HOVERED_PLANT = "TOGGLE_HOVERED_PLANT",
  HOVER_PLANT_LIST_ITEM = "HOVER_PLANT_LIST_ITEM",
  OF_SEARCH_RESULTS_OK = "OF_SEARCH_RESULTS_OK",
  CHOOSE_LOCATION = "CHOOSE_LOCATION",
  SET_CURRENT_POINT_DATA = "SET_CURRENT_POINT_DATA",

  // Regimens
  PUSH_WEEK = "PUSH_WEEK",
  POP_WEEK = "POP_WEEK",
  DESELECT_ALL_DAYS = "DESELECT_ALL_DAYS",
  SELECT_ALL_DAYS = "SELECT_ALL_DAYS",
  TOGGLE_DAY = "TOGGLE_DAY",
  SELECT_REGIMEN = "SELECT_REGIMEN",
  SET_SEQUENCE = "SET_SEQUENCE",
  SET_TIME_OFFSET = "SET_TIME_OFFSET",

  // Sequences
  SELECT_SEQUENCE = "SELECT_SEQUENCE",

  // Farmware
  SELECT_FARMWARE = "SELECT_FARMWARE",
  SELECT_IMAGE = "SELECT_IMAGE",
  FETCH_FIRST_PARTY_FARMWARE_NAMES_OK = "FETCH_FIRST_PARTY_FARMWARE_NAMES_OK",

  // Network
  NETWORK_EDGE_CHANGE = "NETWORK_EDGE_CHANGE",
  RESET_NETWORK = "RESET_NETWORK",
  SET_CONSISTENCY = "SET_CONSISTENCY"
}
