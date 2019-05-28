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

  export const SENSOR_HISTORY =
    trim(`View and filter historical sensor reading data.`);

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
    trim(`Assign a sequence to execute when a Raspberry Pi GPIO pin is
    activated.`);

  export const PIN_BINDING_WARNING =
    trim(`Warning: Binding to a pin without a physical button and
    pull-down resistor connected may put FarmBot into an unstable state.`);

  // Connectivity
  export const CONNECTIVITY =
    trim(`Diagnose connectivity issues with FarmBot and the browser.`);

  // Hardware Settings: Homing and Calibration
  export const HOMING =
    trim(`If encoders or end-stops are enabled, home axis (find zero).`);

  export const CALIBRATION =
    trim(`If encoders or end-stops are enabled, home axis and determine
    maximum.`);

  export const SET_ZERO_POSITION =
    trim(`Set the current location as zero.`);

  export const FIND_HOME_ON_BOOT =
    trim(`If encoders or end-stops are enabled, find the home position when the
    device powers on. Warning! This will perform homing on all axes when the
    device powers on. Encoders or endstops must be enabled. It is recommended
    to make sure homing works properly before enabling this feature.
    (default: disabled)`);

  export const STOP_AT_HOME =
    trim(`Stop at the home location of the axis. (default: disabled)`);

  export const STOP_AT_MAX =
    trim(`Don't allow movement past the maximum value provided in AXIS LENGTH.
    (default: disabled)`);

  export const NEGATIVE_COORDINATES_ONLY =
    trim(`Restrict travel to negative coordinate locations. Overridden by
    disabling STOP AT HOME. (default: x: disabled, y: disabled, z: enabled)`);

  export const LENGTH =
    trim(`Set the length of each axis to provide software limits. Used only if
    STOP AT MAX is enabled. (default: 0 (disabled))`);

  export const TIMEOUT_AFTER =
    trim(`Amount of time to wait for a command to execute before stopping.
    (default: 120s)`);

  // Hardware Settings: Motors
  export const MAX_MOVEMENT_RETRIES =
    trim(`Number of times to retry a movement before stopping. (default: 3)`);

  export const E_STOP_ON_MOV_ERR =
    trim(`Emergency stop if movement is not complete after the maximum number of
    retries. (default: disabled)`);

  export const MAX_SPEED =
    trim(`Maximum travel speed after acceleration in millimeters per second.
    (default: x: 80mm/s, y: 80mm/s, z: 16mm/s)`);

  export const HOME_SPEED =
    trim(`Home position adjustment travel speed (homing and calibration)
    in millimeters per second. (default: x: 10mm/s, y: 10mm/s, z: 2mm/s)`);

  export const MIN_SPEED =
    trim(`Minimum movement speed in millimeters per second. Also used for homing
     and calibration. (default: x: 10mm/s, y: 10mm/s, z: 2mm/s)`);

  export const ACCELERATE_FOR =
    trim(`Number of millimeters used for acceleration and deceleration.
    (default: x: 60mm, y: 60mm, z: 12mm)`);

  export const STEPS_PER_MM =
    trim(`The number of motor steps required to move the axis one millimeter.
    (default: x: 5, y: 5, z: 25)`);

  export const MICROSTEPS_PER_STEP =
    trim(`The number of microsteps required to move the motor one step.
    (default: x: 1, y: 1, z: 1)`);

  export const ALWAYS_POWER_MOTORS =
    trim(`Keep power applied to motors. Prevents slipping from gravity in
    certain situations. (default: enabled)`);

  export const INVERT_MOTORS =
    trim(`Invert direction of motor during calibration. (default: disabled)`);

  export const ENABLE_X2_MOTOR =
    trim(`Enable use of a second x-axis motor. Connects to E0 on RAMPS.
    (default: enabled)`);

  // Hardware Settings: Encoders and Endstops
  export const ENABLE_ENCODERS =
    trim(`Enable use of rotary encoders during calibration and homing.
    (default: enabled)`);

  export const ENCODER_POSITIONING =
    trim(`Use encoders for positioning. (default: disabled)`);

  export const INVERT_ENCODERS =
    trim(`Reverse the direction of encoder position reading.
    (default: disabled)`);

  export const MAX_MISSED_STEPS =
    trim(`Number of steps missed (determined by encoder) before motor is
    considered to have stalled. (default: 5)`);

  export const ENCODER_MISSED_STEP_DECAY =
    trim(`Reduction to missed step total for every good step. (default: 5)`);

  export const ENCODER_SCALING =
    trim(`encoder scaling factor = 10000 * (motor resolution * microsteps)
    / (encoder resolution). (default: 5556 (10000*200/360))`);

  export const ENABLE_ENDSTOPS =
    trim(`Enable use of electronic end-stops during calibration and homing.
    (default: disabled)`);

  export const SWAP_ENDPOINTS =
    trim(`Swap axis minimum and maximum end-stops. (default: disabled)`);

  export const INVERT_ENDPOINTS =
    trim(`Invert axis end-stops. Enable for normally closed (NC),
    disable for normally open (NO). (default: disabled)`);

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
    trim(`The Move To step instructs FarmBot to move to the specified
    coordinate regardless of the current position. For example, if FarmBot is
    currently at X=1000, Y=1000 and it receives a Move To where X=0 and
    Y=3000, then FarmBot will move to X=0, Y=3000. If FarmBot must move in
    multiple directions, it will move diagonally. If you require straight
    movements along one axis at a time, use multiple Move To steps.
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
    preceded by a Move To step to ensure you are starting from a known
    location.`);

  export const WRITE_PIN =
    trim(`The Control Peripheral step instructs FarmBot to set the specified
    pin on the Arduino to the specified mode and value. Use the digital pin mode
    for on (1) and off (0) control, and analog pin mode for PWM (pulse width
    modulation) (0-255).`);

  export const READ_PIN =
    trim(`The Read Sensor step instructs FarmBot to read the
    current value of the specified sensor or peripheral.
    Pin Mode: Use digital for a 0 (LOW) or 1 (HIGH) response,
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

  export const MARK_AS =
    trim(`The Mark As step allows FarmBot to programmatically edit the
    properties of the UTM, plants, and weeds from within a sequence.
    For example, you can mark a plant as "planted" during a seeding
    sequence or delete a weed after removing it.`);

  export const SET_SERVO_ANGLE =
    trim(`Move a servo to the provided angle.`);

  export const TOGGLE_PIN =
    trim(`Toggle a digital pin on or off.`);

  export const MOVE_TO_HOME =
    trim(`Move FarmBot to home for the provided axis.`);

  export const FIRMWARE_ACTION =
    trim(`FarmBot OS or micro-controller firmware action.`);

  export const SYSTEM_ACTION =
    trim(`FarmBot OS action.`);

  export const UNKNOWN_STEP =
    trim(`Unable to properly display this step.`);

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
    trim(`This is a list of all your FarmBot tools and seed containers.
    Click the Edit button to add, edit, or delete tools or seed containers.`);

  export const TOOLBAY_LIST =
    trim(`Tool slots are where you store your FarmBot tools and seed
    containers, which should be reflective of your real FarmBot hardware
    configuration.`);

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

  export const MESSAGES =
    trim(`View messages.`);

  // App
  export const LABS =
    trim(`Customize your web app experience.`);

  export const TOURS =
    trim(`Take a guided tour of the Web App.`);
}

export namespace Content {

  // Account
  export const ACCOUNT_PASSWORD_CHANGE =
    trim(`Upon successful password change, your FarmBot will factory reset
    allowing you to configure it with the updated credentials. You will also be
    logged out of other browser sessions. Continue?`);

  export const ACCOUNT_RESET_WARNING =
    trim(`WARNING! Resetting your account will permanently delete all of your
    Sequences, Regimens, Events, Tools, Logs, and Farm Designer data.
    All app settings and device settings will be reset to default values.
    This is useful if you want to delete all data to start from scratch
    while avoiding having to fully delete your account, re-signup, and
    re-configure your FarmBot. Note that when you sync (or auto-sync)
    after resetting your account, your FarmBot will delete all of its
    stored Sequences, etc, because your account will no longer have any
    of these resources until you create new ones. Furthermore, upon reset
    any customized device settings will be immediately overwritten with
    the default values downloaded from the reset web app account.`);

  export const TYPE_PASSWORD_TO_RESET =
    trim(`If you are sure you want to reset your account, type in
    your password below to continue.`);

  export const ACCOUNT_DELETE_WARNING =
    trim(`WARNING! Deleting your account will permanently delete all of your
    Sequences, Regimens, Events, and Farm Designer data. Upon deleting your
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

  // Messages
  export const SEED_DATA_SELECTION =
    trim(`To finish setting up your account and FarmBot, please select which
    FarmBot you have. Once you make a selection, we'll automatically add some
    tools, sensors, peripherals, sequences, and more to get you up and running
    faster. If you want to start completely from scratch, feel free to select
    "Custom bot" and we won't change a thing.`);

  export const TAKE_A_TOUR =
    trim(`Since you're new around here, we recommend taking our guided tours
    of the app. This is the fastest way to learn about the most important pages
    and features at your fingertips.`);

  export const READ_THE_DOCS =
    trim(`The FarmBot web app is a powerful tool that allows you to control
    and configure your FarmBot in any way you want. To give you so much power,
    we've packed the app with a ton of settings, features, and pages, which
    can be a lot to understand. That's why we've created comprehensive written
    documentation and videos to teach you how to use everything.`);

  export const WELCOME =
    trim(`Let's get you familiar with the app and finish setting everything
    up.`);

  export const MESSAGE_CENTER_WELCOME =
    trim(`Here you'll find important information about your account, your
    FarmBot, and news such as new feature announcements. Look for the blue
    badge in the main menu to see when new messages are available.`);

  export const MESSAGE_DISMISS =
    trim(`When you're finished with a message, press the x button in the
    top right of the card to dismiss it.`);

  export const FIRMWARE_MISSING =
    trim(`Please choose a firmware version to install. Your choice should be
    based on the type of electronics in your FarmBot according to the reference
    table below.`);

  // App Settings
  export const CONFIRM_STEP_DELETION =
    trim(`Show a confirmation dialog when deleting a sequence step.`);

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

  export const TIME_FORMAT_24_HOUR =
    trim(`Display time using the 24-hour notation,
    i.e., 23:00 instead of 11:00pm`);

  export const SHOW_PINS =
    trim(`Show raw pin lists in Read Sensor and Control Peripheral steps.`);

  export const EMERGENCY_UNLOCK_CONFIRM_CONFIG =
    trim(`Confirm when unlocking FarmBot after an emergency stop.`);

  export const CONFIRM_EMERGENCY_UNLOCK_CONFIRM_DISABLE =
    trim(`Warning! When disabled, clicking the UNLOCK button will immediately
    unlock FarmBot instead of confirming that it is safe to do so.
    As a result, double-clicking the E-STOP button may not stop FarmBot.
    Are you sure you want to disable this feature?`);

  // Device
  export const NOT_HTTPS =
    trim(`WARNING: Sending passwords via HTTP:// is not secure.`);

  export const CONTACT_SYSADMIN =
    trim(`Please contact the system(s) administrator(s) and ask them to enable
    HTTPS://`);

  export const FACTORY_RESET_WARNING =
    trim(`Factory resetting your FarmBot will destroy all data on the device,
    revoking your FarmBot's ability to connect to your web app account and your
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

  export const DIFFERENT_TZ_WARNING =
    trim(`Note: The selected timezone for your FarmBot is different than
    your local browser time.`);

  export const RESTART_FARMBOT =
    trim(`This will restart FarmBot's Raspberry Pi and controller
    software.`);

  export const RESTART_FIRMWARE =
    trim(`Restart the Farmduino or Arduino firmware.`);

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

  export const DIAGNOSTIC_CHECK =
    trim(`Save snapshot of FarmBot OS system information, including
    user and device identity, to the database. A code will be returned
    that you can provide in support requests to allow FarmBot to look up
    data relevant to the issue to help us identify the problem.`);

  export const DEVICE_NEVER_SEEN =
    trim(`The device has never been seen. Most likely,
    there is a network connectivity issue on the device's end.`);

  export const TOO_OLD_TO_UPDATE =
    trim(`Please re-flash your FarmBot's SD card.`);

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

  export const WEB_APP_DISCONNECTED =
    trim(`Your web browser is unable to communicate with the
    web app server. Make sure you are connected to the Internet.`);

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

  export const NEW_TOS =
    trim(`Before logging in, you must agree to our latest Terms of Service and
    Privacy Policy`);

  export const FORCE_REFRESH_CONFIRM =
    trim(`A new version of the FarmBot web app has been released. Refresh page?`);

  export const FORCE_REFRESH_CANCEL_WARNING =
    trim(`You may experience data loss if you do not refresh the page.`);

  // Front Page
  export const TOS_UPDATE =
    trim(`The terms of service have recently changed. You must accept the
    new terms of service to continue using the site.`);

  export const VERIFICATION_EMAIL_RESENT =
    trim(`Verification email resent. Please check your email!`);

  export const VERIFICATION_EMAIL_RESEND_ERROR =
    trim(`Unable to resend verification email. Are you already verified?`);

  // Sequences
  export const NO_SEQUENCE_SELECTED =
    trim(`Click one in the Sequences panel to edit, or click "+" to create
    a new one.`);

  export const NO_SEQUENCES =
    trim(`Click "+" to create a new sequence.`);

  export const END_DETECTION_DISABLED =
    trim(`This command will not execute correctly because you do not have
    encoders or endstops enabled for the chosen axis. Enable endstops or
    encoders from the Device page for: `);

  export const IN_USE =
    trim(`Used in another resource. Protected from deletion.`);

  // Regimens
  export const NO_REGIMEN_SELECTED =
    trim(`Click one in the Regimens panel to edit, or click "+" to create
    a new one.`);

  export const NO_REGIMENS =
    trim(`Click "+" to create a new regimen.`);

  // Farm Designer
  export const OUTSIDE_PLANTING_AREA =
    trim(`Outside of planting area. Plants must be placed within the grid.`);

  export const MOVE_MODE_DESCRIPTION =
    trim(`Click a spot in the grid to choose a location.
    Once selected, press button to move FarmBot to this position.
    Press the back arrow to exit.`);

  export const CREATE_POINTS_DESCRIPTION =
    trim(`Click and drag to draw a point or use the inputs and press
    update. Press CREATE POINT to save, or the back arrow to exit.`);

  export const BOX_SELECT_DESCRIPTION =
    trim(`Drag a box around the plants you would like to select.
    Press the back arrow to exit.`);

  export const SAVED_GARDENS =
    trim(`Create new gardens from scratch or by copying plants from the
    current garden. View and edit saved gardens, and, when ready, apply them
    to the main garden.`);

  export const NO_PLANTS =
    trim(`Press "+" to add a plant to your garden.`);

  export const ENTER_CROP_SEARCH_TERM =
    trim(`Search for a crop to add to your garden.`);

  export const CROP_NOT_FOUND_INTRO =
    trim(`Would you like to`);

  export const CROP_NOT_FOUND_LINK =
    trim(`add this crop on OpenFarm?`);

  // Farm Events
  export const NOTHING_SCHEDULED =
    trim(`Press "+" to schedule an event.`);

  export const REGIMEN_TODAY_SKIPPED_ITEM_RISK =
    trim(`You are scheduling a regimen to run today. Be aware that
    running a regimen too late in the day may result in skipped
    regimen tasks. Consider rescheduling this event to tomorrow if
    this is a concern.`);

  export const INVALID_RUN_TIME =
    trim(`This event does not appear to have a valid run time.
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
    trim(`You must set a timezone before using the event feature.`);

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

export namespace TourContent {
  // Getting started
  export const ADD_PLANTS =
    trim(`Add plants by pressing the + button and searching for a plant,
    selecting one, and dragging it into the garden.`);

  export const ADD_TOOLS =
    trim(`Press edit and then the + button to add tools.`);

  export const ADD_TOOLS_SLOTS =
    trim(`Add the newly created tools to the corresponding toolbay slots on
    FarmBot: press edit and then + to create a toolbay slot.`);

  export const ADD_PERIPHERALS =
    trim(`Press edit and then the + button to add peripherals.`);

  export const ADD_SEQUENCES =
    trim(`Press the + button to add a new sequence. You will need
    to create sequences to mount tools, move to the plant locations you
    created in the Farm Designer, and seed/water them.`);

  export const ADD_REGIMENS =
    trim(`Press the + button and add your newly created sequences to a
    regimen via the scheduler. The regimen should include all actions
    needed to take care of a plant over its life.`);

  export const ADD_FARM_EVENTS =
    trim(`Add an event via the + button to schedule a sequence or
    regimen in the calendar.`);

  // Monitoring
  export const LOCATION_GRID =
    trim(`View FarmBot's current location using the axis position display.`);

  export const VIRTUAL_FARMBOT =
    trim(`Or view FarmBot's current location in the virtual garden.`);

  export const LOGS_TABLE =
    trim(`View recent log messages here. More detailed log messages can be
    shown by adjusting filter settings.`);

  export const PHOTOS =
    trim(`View photos your FarmBot has taken here.`);

  // Fun stuff
  export const APP_SETTINGS =
    trim(`Toggle various settings to customize your web app experience.`);
}

export namespace DiagnosticMessages {
  export const OK = trim(`All systems nominal.`);

  export const MISC = trim(`Some other issue is preventing FarmBot from
    working. Please see the table above for more information.`);

  export const TOTAL_BREAKAGE = trim(`There is no access to FarmBot or the
    message broker. This is usually caused by outdated browsers
    (Internet Explorer) or firewalls that block WebSockets on port 3002.`);

  export const REMOTE_FIREWALL = trim(`FarmBot and the browser are both
    connected to the internet (or have been recently). Try rebooting FarmBot
    and refreshing the browser. If the issue persists, something may be
    preventing FarmBot from accessing the message broker (used to communicate
    with your web browser in real-time). If you are on a company or school
    network, a firewall may be blocking port 5672. Ensure that the blue LED
    communications light on the FarmBot electronics box is illuminated.`);

  export const WIFI_OR_CONFIG = trim(`Your browser is connected correctly,
    but we have no recent record of FarmBot connecting to the internet.
    This usually happens because of a bad WiFi signal in the garden, a bad
    password during configuration, or a very long power outage.`);

  export const NO_WS_AVAILABLE = trim(`You are either offline, using a web
   browser that does not support WebSockets, or are behind a firewall that
   blocks port 3002. Do not attempt to debug FarmBot hardware until you solve
   this issue first. You will not be able to troubleshoot hardware issues
   without a reliable browser and internet connection.`);

  export const INACTIVE = trim(`FarmBot and the browser both have internet
    connectivity, but we haven't seen any activity from FarmBot on the Web
    App in a while. This could mean that FarmBot has not synced in a while,
    which might not be a problem. If you are experiencing usability issues,
    however, it could be a sign of HTTP blockage on FarmBot's local internet
    connection.`);

  export const ARDUINO_DISCONNECTED = trim(`Arduino is possibly unplugged.
    Check the USB cable between the Raspberry Pi and the Arduino. Reboot
    FarmBot after a reconnection. If the issue persists, reconfiguration
    of FarmBot OS may be necessary.`);
}

export enum Actions {

  // Resources
  DESTROY_RESOURCE_OK = "DESTROY_RESOURCE_OK",
  INIT_RESOURCE = "INIT_RESOURCE",
  BATCH_INIT = "BATCH_INIT",
  SAVE_RESOURCE_OK = "SAVE_RESOURCE_OK",
  EDIT_RESOURCE = "EDIT_RESOURCE",
  OVERWRITE_RESOURCE = "OVERWRITE_RESOURCE",
  SAVE_RESOURCE_START = "SAVE_RESOURCE_START",
  RESOURCE_READY = "RESOURCE_READY",
  _RESOURCE_NO = "_RESOURCE_NO",
  REFRESH_RESOURCE_START = "REFRESH_RESOURCE_START",
  REFRESH_RESOURCE_OK = "REFRESH_RESOURCE_OK",
  REFRESH_RESOURCE_NO = "REFRESH_RESOURCE_NO",
  DELETE_POINT_OK = "DELETE_POINT_OK",

  // Auth
  REPLACE_TOKEN = "REPLACE_TOKEN",
  LOGIN_ERROR = "LOGIN_ERR",

  // Config
  CHANGE_API_PORT = "CHANGE_API_PORT",
  CHANGE_API_HOST = "CHANGE_API_HOST",
  LOGOUT = "LOGOUT",

  // Devices
  SAVE_DEVICE_OK = "SAVE_DEVICE_OK",
  TOGGLE_CONTROL_PANEL_OPTION = "TOGGLE_CONTROL_PANEL_OPTION",
  BULK_TOGGLE_CONTROL_PANEL = "BULK_TOGGLE_CONTROL_PANEL",
  CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE",
  SETTING_UPDATE_START = "SETTING_UPDATE_START",
  SETTING_UPDATE_END = "SETTING_UPDATE_END",
  /** Used in FBOS < v8. Remove ASAP. RC 21 JAN 18 */
  LEGACY_BOT_CHANGE = "LEGACY_BOT_CHANGE",
  STATUS_UPDATE = "STATUS_UPDATE",
  FETCH_OS_UPDATE_INFO_OK = "FETCH_OS_UPDATE_INFO_OK",
  FETCH_OS_UPDATE_INFO_ERROR = "FETCH_OS_UPDATE_INFO_ERROR",
  FETCH_BETA_OS_UPDATE_INFO_OK = "FETCH_BETA_OS_UPDATE_INFO_OK",
  FETCH_BETA_OS_UPDATE_INFO_ERROR = "FETCH_BETA_OS_UPDATE_INFO_ERROR",
  FETCH_MIN_OS_FEATURE_INFO_OK = "FETCH_MIN_OS_FEATURE_INFO_OK",
  FETCH_MIN_OS_FEATURE_INFO_ERROR = "FETCH_MIN_OS_FEATURE_INFO_ERROR",
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
  OF_SEARCH_RESULTS_START = "OF_SEARCH_RESULTS_START",
  OF_SEARCH_RESULTS_OK = "OF_SEARCH_RESULTS_OK",
  OF_SEARCH_RESULTS_NO = "OF_SEARCH_RESULTS_NO",
  CHOOSE_LOCATION = "CHOOSE_LOCATION",
  SET_CURRENT_POINT_DATA = "SET_CURRENT_POINT_DATA",
  CHOOSE_SAVED_GARDEN = "CHOOSE_SAVED_GARDEN",

  // Regimens
  PUSH_WEEK = "PUSH_WEEK",
  POP_WEEK = "POP_WEEK",
  DESELECT_ALL_DAYS = "DESELECT_ALL_DAYS",
  SELECT_ALL_DAYS = "SELECT_ALL_DAYS",
  TOGGLE_DAY = "TOGGLE_DAY",
  SELECT_REGIMEN = "SELECT_REGIMEN",
  SET_SEQUENCE = "SET_SEQUENCE",
  SET_TIME_OFFSET = "SET_TIME_OFFSET",
  SET_SCHEDULER_STATE = "SET_SCHEDULER_STATE",

  // Sequences
  SELECT_SEQUENCE = "SELECT_SEQUENCE",
  SET_SEQUENCE_POPUP_STATE = "SET_SEQUENCE_POPUP_STATE",
  SET_SEQUENCE_STEP_POSITION = "SET_SEQUENCE_STEP_POSITION",

  // Farmware
  SELECT_FARMWARE = "SELECT_FARMWARE",
  SELECT_IMAGE = "SELECT_IMAGE",
  FETCH_FIRST_PARTY_FARMWARE_NAMES_OK = "FETCH_FIRST_PARTY_FARMWARE_NAMES_OK",
  SET_FARMWARE_INFO_STATE = "SET_FARMWARE_INFO_STATE",

  // App
  START_TOUR = "START_TOUR",

  // Network
  NETWORK_EDGE_CHANGE = "NETWORK_EDGE_CHANGE",
  RESET_NETWORK = "RESET_NETWORK",
  SET_CONSISTENCY = "SET_CONSISTENCY"
}
