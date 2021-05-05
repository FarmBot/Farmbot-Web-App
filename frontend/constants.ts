/* eslint-disable @typescript-eslint/quotes */
import { trim } from "./util";

export namespace ToolTips {

  // Farm Designer: Groups
  export const SORT_DESCRIPTION =
    trim(`When executing a sequence over a Group of locations, FarmBot will
    travel to each group member in the order of the chosen sort method.
    If the random option is chosen, FarmBot will travel in a random order
    every time, so the ordering shown below will only be representative.`);

  export const CRITERIA_SELECTION_COUNT =
    trim(`Filter additions can only be removed by changing filters.
    Click and drag in the map to modify selection filters.
    Filters will be applied at the time of sequence execution. The final
    selection at that time may differ from the selection currently
    displayed.`);

  export const DOT_NOTATION_TIP =
    trim(`Tip: Use dot notation (i.e., 'meta.color') to access meta fields.`);

  // Controls
  export const MOVE =
    trim(`Use these manual control buttons to move FarmBot in realtime.
    Press the arrows for relative movements or type in new coordinates
    and press GO for an absolute movement.
    Tip: Press the Home button when you are done so FarmBot is ready to
    get back to work.`);

  export const WEBCAM =
    trim(`If you have a webcam, you can view the video stream in this widget.
    Press the edit button to update and save your webcam URL.
    Note: Some webcam services do not allow webcam feeds to be embedded in
    other sites. If you see a web browser error after adding a webcam feed,
    there is unfortunately nothing FarmBot can do to fix the problem.
    Please contact your webcam's customer support to see if the security
    policy for embedding feeds into other sites can be changed.`);

  export const PERIPHERALS =
    trim(`Use these toggle switches to control FarmBot's peripherals in
    realtime. To edit and create new peripherals, press the EDIT button.
    Make sure to turn things off when you're done!`);

  export const PINNED_SEQUENCES =
    trim(`Pin a sequence in the sequence editor to add it to this list.`);

  export const SENSORS =
    trim(`Add sensors here to monitor FarmBot's sensors.
    To edit and create new sensors, press the EDIT button.`);

  export const SENSOR_HISTORY =
    trim(`View and filter historical sensor reading data.`);

  // FarmBot OS
  export const VOLTAGE_STATUS =
    trim(`Raspberry Pi power status since last reboot. If supply voltage
    drops below the standard operational threshold the indicator will turn
    red. Once the voltage level recovers the status will turn yellow,
    indicating that a low voltage event has occurred. Low voltage may
    adversely affect WiFi and camera functionality.`);

  // FarmBot OS Settings: Firmware
  export const FIRMWARE_VALUE_API =
    trim(`Firmware value from your choice in the dropdown to the left, as
    understood by the Web App.`);

  export const FIRMWARE_VALUE_FBOS =
    trim(`Firmware value reported from the firmware, as understood by
    FarmBot OS.`);

  export const FIRMWARE_VALUE_MCU =
    trim(`Firmware value reported from the firmware.`);

  // Hardware Settings
  export const HW_SETTINGS =
    trim(`Caution: Changing these settings to extreme values can cause
    hardware malfunction. Make sure to test any new settings to verify
    that everything works as expected before letting your FarmBot use
    them unsupervised.`);

  // Hardware Settings: Axes
  export const FIND_HOME_ENCODERS =
    trim(`If encoders or limit switches are enabled, find home for
    an axis (set zero position).`);

  export const FIND_HOME_STALL_DETECTION =
    trim(`If stall detection or limit switches are enabled, find home for
    an axis (set zero position).`);

  export const FIND_LENGTH_ENCODERS =
    trim(`If encoders or limit switches are enabled, home axis and determine
    maximum. Will set axis length value.`);

  export const FIND_LENGTH_STALL_DETECTION =
    trim(`If stall detection or limit switches are enabled, home axis and
    determine maximum. Will set axis length value.`);

  export const SET_HOME_POSITION =
    trim(`Set the current location as home (zero).`);

  export const FIND_HOME_ON_BOOT_ENCODERS =
    trim(`If encoders or limit switches are enabled, find the home position
    when the device powers on. Warning! This will perform homing on all
    axes when the device powers on. Encoders or limit switches must be enabled.
    It is recommended to make sure homing works properly before enabling
    this feature. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const FIND_HOME_ON_BOOT_STALL_DETECTION =
    trim(`If stall detection or limit switches are enabled, find the home
    position when the device powers on. Warning! This will perform homing
    on all axes when the device powers on. Stall detection or limit switches
    must be enabled. It is recommended to make sure homing works properly
    before enabling this feature. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const STOP_AT_HOME =
    trim(`Stop at the home (zero) location of the axis. If enabled, moving
    past zero is disallowed. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const STOP_AT_MAX =
    trim(`Don't allow movement past the maximum value provided in AXIS LENGTH
    (for AXIS LENGTH values other than '0').
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const NEGATIVE_COORDINATES_ONLY =
    trim(`Restrict travel to negative coordinate locations.
    Overridden by disabling STOP AT HOME.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const CALIBRATION_RETRIES =
    trim(`Number of times to retry calibration.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const AXIS_LENGTH =
    trim(`Set the length of each axis to provide software limits.
    Used only if STOP AT MAX is enabled.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }} (disabled))`);

  export const SAFE_HEIGHT =
    trim(`Z axis coordinate (millimeters) to which the z axis should be
    retracted during Safe Z moves. It is recommended to choose a value at
    which the z axis is all of the way up to provide as much clearance as
    possible. (default: 0)`);

  export const SOIL_HEIGHT =
    trim(`Z axis coordinate (millimeters) of soil level. (default: 0)`);

  // Hardware Settings: Motors
  export const MAX_SPEED =
    trim(`Maximum travel speed after acceleration in millimeters per second.
    (default: x: {{ x }}mm/s, y: {{ y }}mm/s, z: {{ z }}mm/s)`);

  export const MAX_SPEED_Z_TOWARD_HOME =
    trim(`Maximum travel speed after acceleration in millimeters per second.
    (default: {{ z }}mm/s)`);

  export const HOME_SPEED =
    trim(`Home position adjustment travel speed (homing and finding axis length)
    in millimeters per second.
    (default: x: {{ x }}mm/s, y: {{ y }}mm/s, z: {{ z }}mm/s)`);

  export const MIN_SPEED =
    trim(`Minimum movement speed in millimeters per second.
    Also used for homing and finding axis length.
    (default: x: {{ x }}mm/s, y: {{ y }}mm/s, z: {{ z }}mm/s)`);

  export const MIN_SPEED_Z_TOWARD_HOME =
    trim(`Minimum movement speed in millimeters per second.
    Also used for homing and finding axis length.
    (default: {{ z }}mm/s)`);

  export const ACCELERATE_FOR =
    trim(`Number of millimeters used for acceleration and deceleration.
    (default: x: {{ x }}mm, y: {{ y }}mm, z: {{ z }}mm)`);

  export const ACCELERATE_FOR_Z_TOWARD_HOME =
    trim(`Number of millimeters used for acceleration and deceleration.
    (default: {{ z }}mm)`);

  export const STEPS_PER_MM =
    trim(`The number of motor steps required to move the axis one millimeter.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MICROSTEPS_PER_STEP =
    trim(`The number of microsteps required to move the motor one step.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const ALWAYS_POWER_MOTORS =
    trim(`Keep power applied to motors. Prevents slipping from gravity in
    certain situations. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const INVERT_MOTORS =
    trim(`Invert direction of motor while finding axis length.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MOTOR_CURRENT =
    trim(`Motor current in milliamps.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const ENABLE_X2_MOTOR =
    trim(`Enable use of a second x-axis motor. Connects to E0 on RAMPS.
    (default: {{ x2Motor }})`);

  export const INVERT_X2_MOTOR =
    trim(`Invert direction of motor. (default: {{ x }})`);

  // Hardware Settings: Encoders / Stall Detection
  export const ENABLE_ENCODERS =
    trim(`Enable use of rotary encoders for stall detection,
    finding axis length, and homing.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const ENABLE_STALL_DETECTION =
    trim(`Enable use of motor stall detection for detecting missed steps,
    finding axis length, and homing.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const STALL_SENSITIVITY =
    trim(`Motor stall sensitivity. Most sensitive: -63.
    Least sensitive: +63. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const USE_ENCODERS_FOR_POSITIONING =
    trim(`Use encoders for positioning.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const INVERT_ENCODERS =
    trim(`Reverse the direction of encoder position reading.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MAX_MISSED_STEPS_ENCODERS =
    trim(`Number of steps missed (determined by encoder) before motor is
    considered to have stalled. (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MAX_MISSED_STEPS_STALL_DETECTION =
    trim(`Maximum motor load (determined by stepper driver) before
    motor is considered to have stalled.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MISSED_STEP_DECAY_ENCODERS =
    trim(`Reduction to missed step total for every good step.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const MISSED_STEP_DECAY_STALL_DETECTION =
    trim(`Number of steps for stall detection to ignore during acceleration.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const ENCODER_SCALING =
    trim(`encoder scaling factor = 10000 * (motor resolution * microsteps)
    / (encoder resolution).
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }} (10000*200/360))`);

  // Hardware Settings: Limit Switches
  export const ENABLE_LIMIT_SWITCHES =
    trim(`Enable use of electronic limit switches for end detection,
    finding axis length, and homing. Limit switches are contact switches or
    momentary push buttons that can be added to the end of each axis to
    be engaged when an axis reaches the end.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const SWAP_LIMIT_SWITCHES =
    trim(`Swap axis minimum and maximum limit switches.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  export const INVERT_LIMIT_SWITCHES =
    trim(`Invert axis limit switches. Enable for normally closed (NC),
    disable for normally open (NO).
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }})`);

  // Hardware Settings: Error Handling
  export const TIMEOUT_AFTER =
    trim(`Amount of time to wait for a command to execute before stopping.
    (default: x: {{ x }}, y: {{ y }}, z: {{ z }} seconds)`);

  export const MAX_MOVEMENT_RETRIES =
    trim(`Number of times to retry a movement before stopping.
    (default: {{ retries }})`);

  export const E_STOP_ON_MOV_ERR =
    trim(`Emergency stop if movement is not complete after the maximum
    number of retries. (default: {{ eStopOnError }})`);

  // Hardware Settings: Pin Bindings
  export const PIN_BINDINGS =
    trim(`Assign an action or sequence to execute when a Raspberry Pi
    GPIO pin is activated.`);

  export const PIN_BINDING_WARNING =
    trim(`Warning: Binding to a pin without a physical button and
    pull-down resistor connected may put FarmBot into an unstable state.`);

  // Hardware Settings: Pin Guard
  export const PIN_GUARD_PIN_NUMBER =
    trim(`The number of the pin to guard. This pin will be set to the specified
    state after the duration specified by TIMEOUT.`);

  // Hardware Parameter Management
  export const PARAMETER_LOAD_PROGRESS =
    trim(`FarmBot adoption of hardware parameter changes. Tip: If progress
    does not reach 100% within a few minutes, press RESEND.`);

  export const PARAMETER_IMPORT =
    trim(`Paste the output from EXPORT PARAMETERS into the text field and
    press IMPORT to import new hardware parameters to your FarmBot.`);

  // Photos
  export const WEED_DETECTOR =
    trim(`Detect weeds using FarmBot's camera and display them on the
    Farm Designer map.`);

  export const SOIL_HEIGHT_DETECTION =
    trim(`Detect soil height using FarmBot's camera and display the results
    on the Farm Designer map.`);

  export const CAMERA_CALIBRATION =
    trim(`Calibrate FarmBot's camera for use in the weed detection software.`);

  export const RED_DOT_CAMERA_CALIBRATION =
    trim(`Genesis v1.2 through v1.4 bots did not include the camera
    calibration card. Instead, these kits included red calibration objects
    and must be calibrated using an alternative method`);

  export const CAMERA_CALIBRATION_CARD_SHOP_LINK =
    trim(`Camera calibration cards are available in the shop and can be
    used with any FarmBot version.`);

  export const INVERT_HUE_SELECTION =
    trim(`Invert the range of hues selected. Typically used to select the
    full range of reds. (default: {{ defaultInvertState }})`);

  export const OBJECT_SEPARATION =
    trim(`Distance between calibration objects in millimeters. The distance
    between the objects on the camera calibration card is 100mm.
    (default: {{ defaultSeparation }})`);

  export const CALIBRATION_OBJECT_AXIS =
    trim(`The FarmBot axis along which the calibration objects are aligned.
    (default: {{ defaultAxis }})`);

  export const CAMERA_OFFSET =
    trim(`Camera offset from the UTM position in millimeters.
    Once calibrated, use these values to align photos to the Farm Designer
    grid by matching the grid and locations in photos to the grid and
    locations in the Farm Designer.
    (default: (x: {{ defaultX }}, y: {{ defaultY }}))`);

  export const IMAGE_BOT_ORIGIN_LOCATION =
    trim(`FarmBot origin (home) location in images. If the origin does not
    correspond to an image corner, rotate the camera until one does.
    (default: {{ defaultOrigin }})`);

  export const COORDINATE_SCALE =
    trim(`Image pixel to FarmBot coordinate scale. Typically between
    0.1 and 2, this value matches image scale with the FarmBot coordinate
    system. (default: {{ defaultScale }} (uncalibrated))`);

  export const IMAGE_ROTATION_ANGLE =
    trim(`Camera rotation in degrees. This value should be minimized
    (to near zero) by rotating the camera in its mount until it is aligned
    with FarmBot's axes. (default: {{ defaultAngle }})`);

  export const BLUR =
    trim(`Image blur kernel size. Must be an odd number greater than 1.
    (default: {{ defaultBlur }})`);

  export const MORPH =
    trim(`Size of the structuring element used for morphological
    transformations. (default: {{ defaultMorph }})`);

  export const ITERATIONS =
    trim(`Number of erosion and dilation morphological transformation
    cycles. (default: {{ defaultIteration }})`);

  export const COLOR_HUE_RANGE =
    trim(`Color range.
    (default: {{ defaultLow }} - {{ defaultHigh }} ({{ defaultColor }}))`);

  export const COLOR_SATURATION_RANGE =
    trim(`Color saturation, 0 (white) to 255 (color).
    (default: {{ defaultLow }} - {{ defaultHigh }})`);

  export const COLOR_VALUE_RANGE =
    trim(`Color value, 0 (black) to 255 (color)
    (default: {{ defaultLow }} - {{ defaultHigh }})`);

  // Sequences
  export const SEQUENCE_COMMANDS =
    trim(`These are the most basic commands FarmBot can execute. Drag and drop
    them to create sequences for watering, planting seeds, measuring soil
    properties, and more.`);

  export const SEQUENCE_EDITOR =
    trim(`Drag and drop commands here to create sequences for watering,
    planting seeds, measuring soil properties, and more.
    Press the Test button to immediately try your sequence with FarmBot.
    You can also edit, copy, and delete existing sequences;
    assign a color; and give your commands custom names.`);

  export const DEFAULT_VALUE =
    trim(`Select a location to be used as the default value for this variable.
    If the sequence is ever run without the variable explicitly set to
    another value, the default value will be used.`);

  export const USING_DEFAULT_VARIABLE_VALUE =
    trim(`No location selected. Using default value.`);

  export const COMPUTED_MOVE =
    trim(`The Move step instructs FarmBot to move to the specified
    coordinate or distance from its current location.`);

  export const SAFE_Z =
    trim(`If enabled, FarmBot will: (1) Move Z to the Safe Z height,
    (2) Move X and Y to the new location, and (3) Move Z to the new location`);

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
    trim(`The Move Relative step instructs FarmBot to move the specified
    distance from its current location. For example, if FarmBot is
    currently at X=1000, Y=1000 and it receives a Move Relative
    where X=0 and Y=3000, then FarmBot will move to X=1000, Y=4000.
    If FarmBot must move in multiple directions, it will move diagonally.
    If you require straight movements along one axis at a time,
    use multiple Move Relative steps. Move Relative steps should be
    preceded by a Move To step to ensure you are starting from a known
    location.`);

  export const WRITE_PIN =
    trim(`The Control Peripheral step instructs FarmBot to set the
    specified pin on the Arduino to the specified mode and value.
    Use the digital pin mode for on (1) and off (0) control,
    and analog pin mode for PWM (pulse width modulation) (0-255).`);

  export const READ_PIN =
    trim(`The Read Sensor step instructs FarmBot to read the
    current value of the specified sensor or peripheral.
    Pin Mode: Use digital for a 0 (LOW) or 1 (HIGH) response,
    and analog for a voltage reading (0-1023 for 0-5V).`);

  export const WAIT =
    trim(`The Wait step instructs FarmBot to wait for the specified amount
    of time. Use it in combination with the Control Peripheral step to
    water for a length of time.`);

  export const SEND_MESSAGE =
    trim(`The Send Message step instructs FarmBot to send a custom message
    to the logs (and toast message and/or email, if selected). This can
    help you with debugging your sequences.`);

  export const FIND_HOME =
    trim(`The Find Home step instructs the device to perform a homing
    command (using encoders, stall detection, or limit switches) to find and set
    home (zero) for the chosen axis or axes.`);

  export const CALIBRATE =
    trim(`If encoders, stall detection, or limit switches are enabled,
    home axis and determine maximum. Will set axis length value.`);

  export const IF =
    trim(`Execute a sequence if a condition is satisfied. If the condition
    is not satisfied, chose to do nothing or execute a different sequence.`);

  export const EXECUTE_SEQUENCE =
    trim(`Executes another sequence.`);

  export const EXECUTE_SCRIPT =
    trim(`The Run Farmware step runs a Farmware package.
    Visit the Farmware panel to install and manage Farmware.`);

  export const DETECT_WEEDS =
    trim(`The Detect Weeds step takes a photo and detects any weeds in the area.
    Visit the Photos panel to view results or change parameters.`);

  export const MEASURE_SOIL_HEIGHT =
    trim(`The Measure Soil Height step takes a photo and detects the
    z-axis coordinate of the visible soil surface. Visit the Points panel
    to view results or visit the Farmware panel to change parameters.`);

  export const FARMWARE_CONFIGS =
    trim(`The Farmware will use the parameter values set via the Farmware
    panel for any parameters that are not set in this sequence step.`);

  export const TAKE_PHOTO =
    trim(`Snaps a photo using the device camera. Select the camera type
    in the Settings panel.`);

  export const EMERGENCY_LOCK =
    trim(`Stops a device from moving until it is unlocked by a user.`);

  export const SELECT_A_CAMERA =
    trim(`Select a camera on the Settings panel to take photos.`);

  export const ROTATE_IMAGE_AT_CAPTURE =
    trim(`Perform camera rotation compensation when image is captured
    instead of in garden map. If enabled, image files will include
    adjustment for camera rotation (black angled borders may show in
    viewer). Enabling this setting will slow down photo capture.`);

  export const IMAGE_RESOLUTION =
    trim(`The camera will capture images at the closest available resolution
    to the selected size. Changing image resolution requires recalibration
    of the camera. Higher quality images will take longer to process.`);

  export const CALIBRATION_REQUIRED =
    trim(`Calibrate your camera in the Photos panel before detecting weeds.`);

  export const MARK_AS =
    trim(`The Mark As step allows FarmBot to programmatically edit the
    properties of the UTM, plants, and weeds from within a sequence.
    For example, you can mark a plant as "planted" during a seeding
    sequence or mark a weed as "removed" after removing it.`);

  export const SET_SERVO_ANGLE =
    trim(`Move a servo to the provided angle. An angle of 90 degrees
    corresponds to the servo midpoint (or, for a continuous rotation
    servo, no movement). Tip: follow with a WAIT command to allow the servo
    to reach the target position.`);

  export const TOGGLE_PIN =
    trim(`Toggle a digital pin on or off.`);

  export const MOVE_TO_HOME =
    trim(`Move FarmBot to home for the provided axis.`);

  export const ASSERTION =
    trim(`Evaluate Lua commands. For power users and software developers.`);

  export const LUA =
    trim(`Execute Lua commands. For power users and software developers.`);

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
    trim(`Log all commands sent to firmware. Messages will disappear upon
    refresh. Automatically disabled after 5 minutes.`);

  export const FIRMWARE_LOG_RECEIVED =
    trim(`Log all responses received from firmware. Warning: extremely
    verbose. Messages will disappear upon refresh. Automatically disabled
    after 5 minutes.`);

  export const FIRMWARE_DEBUG_MESSAGES =
    trim(`Log all debug messages received from firmware. Messages will
    disappear upon refresh.`);
}

export namespace Content {

  // Account
  export const CHECK_EMAIL_TO_CONFIRM =
    trim(`Please check your email to confirm email address changes.`);

  export const ACCOUNT_PASSWORD_CHANGE =
    trim(`Upon successful password change, your FarmBot will soft reset
    allowing you to configure it with the updated credentials.
    You will also be logged out of other browser sessions. Continue?`);

  export const ACCOUNT_RESET_WARNING =
    trim(`WARNING! Resetting your account will permanently delete all of your
    Sequences, Regimens, Events, Tools, Logs, and Farm Designer data.
    All app settings and device settings will be reset to default values.
    This is useful if you want to delete all data to start from scratch
    while avoiding having to fully delete your account, re-signup, and
    re-configure your FarmBot. Note that when FarmBot syncs
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
    email as JSON file attachments.`);

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

  export const DEMO_ACCOUNT =
    trim(`Thanks for trying out the FarmBot web app!
    This is a great way to introduce yourself to building sequences,
    regimens, events, and designing a virtual garden.`);

  export const DEMO_NOTE =
    trim(`not all features of the app will work because there is not a
    real FarmBot connected to this account. Additionally, keep in mind
    that when you leave this web page, the demo account and all data will
    be deleted.`);

  export const MAKE_A_REAL_ACCOUNT =
    trim(`If you want to play around and keep your data, feel free to make a
    real account at`);

  export const SETUP_INCOMPLETE =
    trim(`Finish setting up your account and FarmBot using our setup wizard.
    To open the setup wizard, click the **Setup: {{ percentComplete }}**
    button in the main navigation bar.`);

  // Support
  export const PRIORITY_SUPPORT =
    trim(`Get in touch with our support staff. Only available to customers
    with a`);

  export const STANDARD_SUPPORT =
    trim(`Get in touch with our support staff. Only available to customers
    who have purchased a full FarmBot kit from FarmBot Inc.`);

  export const FORUM_SUPPORT =
    trim(`Have a question for the greater FarmBot community? Get help by
    asking our global community of users on the`);

  export const FEEDBACK_NOTICE =
    trim(`Feedback submitted through this form will be linked to your user
    account and email so that we may follow up when necessary. If your
    account email is not the best way for a support technician to reach
    you, please include your phone number or preferred means of contact.`);

  export const MUST_REGISTER =
    trim(`You must register your original FarmBot order number before
    contacting support.`);

  // App Settings
  export const INTERNATIONALIZE_WEB_APP =
    trim(`Turn off to set Web App to English.`);

  export const TIME_FORMAT_24_HOUR =
    trim(`Display time using the 24-hour notation,
    i.e., 23:00 instead of 11:00pm`);

  export const TIME_FORMAT_SECONDS =
    trim(`Display seconds in time, i.e., 10:00:00am instead of 10:00am`);

  export const HIDE_WEBCAM_WIDGET =
    trim(`If not using a webcam, use this setting to remove the
    widget from the Controls panel.`);

  export const HIDE_SENSORS_WIDGET =
    trim(`If not using sensors, use this setting to remove the
    panel from the Farm Designer.`);

  export const BROWSER_SPEAK_LOGS =
    trim(`Have the browser also read aloud log messages on the
    "Speak" channel that are spoken by FarmBot.`);

  export const DISCARD_UNSAVED_CHANGES =
    trim(`Don't ask about saving work before
    closing browser tab. Warning: may cause loss of data.`);

  export const DISCARD_UNSAVED_CHANGES_CONFIRM =
    trim(`Warning! When enabled, any unsaved changes
    will be discarded when refreshing or closing the page. Are you sure?`);

  export const EMERGENCY_UNLOCK_CONFIRM_CONFIG =
    trim(`Confirm when unlocking FarmBot after an emergency stop.`);

  export const CONFIRM_EMERGENCY_UNLOCK_CONFIRM_DISABLE =
    trim(`Warning! When disabled, clicking the UNLOCK button will immediately
    unlock FarmBot instead of confirming that it is safe to do so.
    As a result, double-clicking the E-STOP button may not stop FarmBot.
    Are you sure you want to disable this feature?`);

  export const USER_INTERFACE_READ_ONLY_MODE =
    trim(`Disallow account data changes. This does
    not prevent Farmwares or FarmBot OS from changing settings.`);

  // Sequence Settings
  export const CONFIRM_STEP_DELETION =
    trim(`Show a confirmation dialog when deleting a sequence step.`);

  export const CONFIRM_SEQUENCE_DELETION =
    trim(`Show a confirmation dialog when deleting a sequence.`);

  export const SHOW_PINS =
    trim(`Show raw pin lists in Read Sensor, Control Peripheral, and
    If Statement steps.`);

  export const EXPAND_STEP_OPTIONS =
    trim(`Choose whether advanced step options are open or closed by default.`);

  export const DISCARD_UNSAVED_SEQUENCE_CHANGES =
    trim(`Don't ask about saving sequence work before
    closing browser tab. Warning: may cause loss of data.`);

  export const DISCARD_UNSAVED_SEQUENCE_CHANGES_CONFIRM =
    trim(`Warning! When enabled, any unsaved changes to sequences
    will be discarded when refreshing or closing the page. Are you sure?`);

  export const VIEW_CELERY_SCRIPT =
    trim(`View raw data representation of sequence steps.`);

  // FarmBot OS Settings
  export const DIFFERENT_TZ_WARNING =
    trim(`Note: The selected timezone for your FarmBot is different than
    your local browser time.`);

  export const UNSTABLE_RELEASE_CHANNEL_WARNING =
    trim(`Warning! Leaving the stable FarmBot OS release channel may reduce
    FarmBot system stability. Are you sure?`);

  export const DEVICE_NEVER_SEEN =
    trim(`The device has never been seen. Most likely,
    there is a network connectivity issue on the device's end.`);

  export const TOO_OLD_TO_UPDATE =
    trim(`Please re-flash your FarmBot's SD card.`);

  export const OS_AUTO_UPDATE =
    trim(`When enabled, FarmBot OS will automatically download and install
    software updates at the chosen time.`);

  // FarmBot OS Settings: Firmware
  export const RESTART_FIRMWARE =
    trim(`Restart the Farmduino or Arduino firmware.`);

  // FarmBot OS Settings: Power and Reset
  export const RESTART_FARMBOT =
    trim(`This will restart FarmBot's Raspberry Pi and controller
    software.`);

  export const SHUTDOWN_FARMBOT =
    trim(`This will shutdown FarmBot's Raspberry Pi. To turn it
    back on, unplug FarmBot and plug it back in.`);

  export const SOFT_RESET_WARNING =
    trim(`Soft resetting your FarmBot will revoke your FarmBot's ability
    to connect to your web app account and your home WiFi network.
    Upon soft resetting, your device will go into Configurator mode.`);

  export const SOFT_RESET_ALERT =
    trim(`Warning: This will erase data stored on your FarmBot's SD card,
    requiring you to reconfigure FarmBot so that it can reconnect to your
    WiFi network and web app account. Soft resetting the device will
    not delete data stored in your web app account. Are you sure you wish
    to continue?`);

  export const HARD_RESET_WARNING =
    trim(`Hard reset your FarmBot by reflashing the latest version of
    FarmBot OS onto the microSD card. This will erase all data from the
    device and allow you to start from a clean slate. This is recommended
    if you are experiencing problems with your setup. Upon hard resetting,
    your device will go into Configurator mode.`);

  export const OS_RESET_WARNING =
    trim(`{{ resetMethod }} resetting your FarmBot will not affect any of
    your data or settings from your web app account, allowing you to do a
    complete restore to your device once it is back online and paired with
    your web app account.`);

  export const AUTO_SOFT_RESET =
    trim(`Automatically soft reset when the WiFi network cannot be
    detected. Useful for network changes.`);

  export const AUTO_SOFT_RESET_PERIOD =
    trim(`Time in minutes to attempt connecting to WiFi before a soft
    reset.`);

  export const NOT_HTTPS =
    trim(`WARNING: Sending passwords via HTTP:// is not secure.`);

  export const CONTACT_SYSADMIN =
    trim(`Please contact the system(s) administrator(s) and ask them to enable
    HTTPS://`);

  // Hardware Settings: Stall Detection
  export const STALL_DETECTION_NOT_AVAILABLE =
    trim(`Stall detection for FarmBot Express bots is not yet available.
    Once it is ready, you will receive a message in the Message Center.
    We thank you for your patience.`);

  export const STALL_DETECTION_IN_BETA =
    trim(`Warning: Stall detection for FarmBot Express bots is now
    available as a public beta. While you may enable stall detection for
    all three axes, you may not achieve desirable or consistent results
    for some or any of the axes. If you experience any issues, we advise
    you to wait until there are further updates. We are working hard to
    improve this system and thank you for your patience. Feedback is
    appreciated and may be provided on the community forum.`);

  // Hardware Settings: Limit Switches
  export const LIMIT_SWITCH_WARNING =
    trim(`Warning: Limit switches are NOT included with standard FarmBot
    Genesis or Express kits. Do NOT enable limit switches unless you have
    built your own FarmBot with them or added them to a stock kit.`);

  // Hardware Settings: Parameter Management
  export const RESTORE_DEFAULT_HARDWARE_SETTINGS =
    trim(`Restoring hardware parameter defaults will destroy the
    current settings, resetting them to default values.`);

  export const MCU_RESET_ALERT =
    trim(`Warning: This will reset all hardware settings to the default values.
    Are you sure you wish to continue?`);

  export const PARAMETER_IMPORT_CONFIRM =
    trim(`Warning: This will overwrite all existing hardware settings,
    replacing them with the provided values. Are you sure you wish to continue?`);

  // Farm Designer Settings
  export const PLANT_ANIMATIONS =
    trim(`Enable plant animations in the garden map.`);

  export const VIRTUAL_TRAIL =
    trim(`Display a virtual trail for FarmBot in the garden map to show
    movement and watering history while the map is open. Toggling this setting
    will clear data for the current trail.`);

  export const MAP_MISSED_STEPS =
    trim(`Display high motor load warning indicators in map.
    Requires VIRTUAL FARMBOT TRAIL and stall detection to be enabled.`);

  export const DYNAMIC_MAP_SIZE =
    trim(`Change the garden map size based on axis length.
    A value must be input in AXIS LENGTH and STOP AT MAX must be enabled in
    the HARDWARE widget. Overrides MAP SIZE values.`);

  export const MAP_SIZE =
    trim(`Specify custom map dimensions (in millimeters).
    These values set the size of the garden map unless
    DYNAMIC MAP SIZE is enabled.`);

  export const MAP_SWAP_XY =
    trim(`Swap map X and Y axes, making the Y axis horizontal and X axis
    vertical. This setting will also swap the X and Y jog control buttons
    in the Move widget.`);

  export const MAP_ORIGIN =
    trim(`Select a map origin by clicking on one of the four quadrants to
    adjust the garden map to your viewing angle.`);

  export const CROP_MAP_IMAGES =
    trim(`Crop images displayed in the garden map to remove black borders
    from image rotation. Crop amount determined by CAMERA ROTATION value.`);

  export const SHOW_CAMERA_VIEW_AREA =
    trim(`Show the camera's field of view in the garden map.`);

  export const CONFIRM_PLANT_DELETION =
    trim(`Show a confirmation dialog when deleting a plant.`);

  // App
  export const APP_LOAD_TIMEOUT_MESSAGE =
    trim(`App could not be fully loaded, we recommend you try
    refreshing the page.`);

  export const MQTT_DISCONNECTED =
    trim(`Your web browser is unable to connect to the message broker.
    You might be behind a firewall or disconnected from the Internet. Check
    your network settings. View the connection status for more details.`);

  export const WEB_APP_DISCONNECTED =
    trim(`Your web browser is unable to communicate with the
    web app server. Make sure you are connected to the Internet.`);

  export const MALFORMED_MESSAGE_REC_UPGRADE =
    trim(`FarmBot sent a malformed message. You may need to upgrade
    FarmBot OS. Please upgrade FarmBot OS and log back in.`);

  export const OLD_FBOS_REC_UPGRADE =
    trim(`Your version of FarmBot OS is outdated and will soon no longer
    be supported. Please update your device as soon as possible.`);

  export const OLD_FBOS_UNSUPPORTED =
    trim(`You are running an old version of FarmBot OS that is no longer
    supported.`);

  export const EXPERIMENTAL_WARNING =
    trim(`Warning! This is an EXPERIMENTAL feature. This feature may be
    broken and may break or otherwise hinder your usage of the rest of the
    app. This feature may disappear or break at any time.`);

  export const FORCE_REFRESH_CONFIRM =
    trim(`A new version of the FarmBot web app has been released.
    Refresh page?`);

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

  export const RECURSIVE =
    trim(`This step executes the sequence that contains it, which may
    cause an infinite loop.`);

  export const END_DETECTION_DISABLED =
    trim(`This command will not execute correctly because you do not have
    encoders, stall detection, or limit switches enabled for the chosen axis.
    Enable limit switches, encoders, or stall detection from the Settings panel
    for: `);

  export const REBOOT_STEP =
    trim(`Power cycle FarmBot's onboard computer.`);

  export const SHUTDOWN_STEP =
    trim(`Power down FarmBot's onboard computer.`);

  export const ESTOP_STEP =
    trim(`Unlocking a device requires user intervention.`);

  export const IN_USE =
    trim(`Used in another resource. Protected from deletion.`);

  export const INCLUDES_DEPRECATED_STEPS =
    trim(`This sequence includes deprecated steps.`);

  export const IS_PINNED =
    trim(`This sequence is pinned.`);

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
    trim(`Click and drag or use the inputs to draw a point.`);

  export const CREATE_WEEDS_DESCRIPTION =
    trim(`Click and drag or use the inputs to draw a weed.`);

  export const BOX_SELECT_DESCRIPTION =
    trim(`Drag a box around the items you would like to select.
    Press the back arrow to exit.`);

  export const SAVED_GARDENS =
    trim(`Create a new garden from scratch or by copying plants from the
    current garden.`);

  export const ERROR_PLANT_TEMPLATE_GROUP =
    trim(`Cannot create a group with these plants.
    Try leaving the saved garden first.`);

  export const NO_PLANTS =
    trim(`Press "+" to add a plant to your garden.`);

  export const NO_GARDENS =
    trim(`Press "+" to add a garden.`);

  export const NO_POINTS =
    trim(`Press "+" to add a point to your garden.`);

  export const NO_GROUPS =
    trim(`Press "+" to add a group.`);

  export const NO_WEEDS =
    trim(`Press "+" to add a weed.`);

  export const NO_FARMWARE =
    trim(`Press "+" to add a Farmware.`);

  export const NO_PERIPHERALS =
    trim(`Press "edit" to add a peripheral.`);

  export const NO_SENSORS =
    trim(`Press "edit" to add a sensor.`);

  export const NO_ZONES =
    trim(`Press "+" to add a zone.`);

  export const ENTER_CROP_SEARCH_TERM =
    trim(`Search for a crop to add to your garden.`);

  export const CROP_NOT_FOUND_INTRO =
    trim(`Would you like to`);

  export const CROP_NOT_FOUND_LINK =
    trim(`add this crop on OpenFarm?`);

  export const NO_TOOLS =
    trim(`Press "+" to add a new tool or seed container.`);

  export const NO_SEED_CONTAINERS =
    trim(`Press "+" to add a seed container.`);

  export const MOUNTED_TOOL =
    trim(`The tool currently mounted to the UTM can be set here or by using
    a MARK AS step in a sequence. Use the verify button or read the tool
    verification pin in a sequence to verify that a tool is attached.`);

  // Farm Events
  export const NOTHING_SCHEDULED =
    trim(`Press "+" to schedule an event.`);

  export const REGIMEN_TODAY_SKIPPED_ITEM_RISK =
    trim(`You are scheduling a regimen to run today. Be aware that
    running a regimen too late in the day may result in skipped
    regimen tasks. Consider rescheduling this event to tomorrow if
    this is a concern.`);

  export const FARM_EVENT_TZ_WARNING =
    trim(`Note: Times displayed according to FarmBot's local time, which
    is currently different from your browser's time. Timezone data is
    configurable in the Settings panel).`);

  export const FIRST_PARTY_WARNING =
    trim(`Are you sure you want to delete this first party farmware?
    Doing so will limit the functionality of your FarmBot and
    may cause unexpected behavior.`);

  export const MISSING_EXECUTABLE =
    trim(`You haven't made any sequences or regimens yet. To add an event,
    first create a sequence or regimen.`);

  // Farmware
  export const NO_IMAGES_YET =
    trim(`You haven't yet taken any photos with your FarmBot.
    Once you do, they will show up here.`);

  export const PROCESSING_PHOTO =
    trim(`Processing now. Results usually available in one minute.
    Check log messages for result status.`);

  export const NOT_AVAILABLE_WHEN_OFFLINE =
    trim(`Not available when device is offline.`);

  export const NO_CAMERA_SELECTED =
    trim(`No camera selected`);

  export const CAMERA_NOT_CALIBRATED =
    trim(`Camera calibration required`);

  export const CAMERA_CALIBRATION_RED_OBJECTS =
    trim(`Place the two red calibration objects 100mm apart and aligned
    with FarmBot's axes on the soil underneath the camera.`);

  export const CAMERA_CALIBRATION_GRID_PATTERN =
    trim(`Place the camera calibration card face down on the soil
    underneath the camera, with the grid of white circles facing up.
    Can be in any orientation but must be fully visible to the camera.
    Caution: FarmBot will make three small x-axis and y-axis movements
    during calibration.`);

  export const FARMWARE_ENV_EDITOR_WARNING =
    trim(`Warning: Changing the values below may cause app and device errors.`);

  export const FARMWARE_ENV_EDITOR_INFO =
    trim(`Environment variables added here can be accessed via the LUA
    sequence step 'env()' function.`);

  // Other
  export const DOWNLOAD_FBOS =
    trim(`Download the version of FarmBot OS that corresponds to your
    FarmBot kit and its internal computer.`);
}

export namespace TourContent {
  // Getting started
  export const GETTING_STARTED =
    trim(`Welcome to the FarmBot web app! In this tour you'll become
    familiar with the overall organization of the app.`);

  export const PLANTS_PANEL =
    trim(`This is the plants panel. Here you can view and manage all of the
    plants in your garden. Mousing over a plant in the list wil highlight
    it in the map and vice versa. Clicking a plant will open up the plant
    details panel where you can edit it.`);

  export const GROUPS_PANEL =
    trim(`This is the groups panel. Here you can view and manage all of the
    groups in your garden. Clicking a group will open up the groups
    details panel where you can edit it.`);

  export const SAVED_GARDENS_PANEL =
    trim(`This is the gardens panel. Here you can view and manage all of
    your gardens. Clicking a garden will open up the garden details panel
    where you can edit it.`);

  export const SEQUENCES_PANEL =
    trim(`This is the sequences panel. Here you can view and manage all of
    your sequences. Clicking a sequence will open up the sequence editor panel
    where you can edit it.`);

  export const REGIMENS_PANEL =
    trim(`This is the regimens panel. Here you can view and manage all of
    your regimens. Clicking a regimen will open up the regimen editor panel
    where you can edit it.`);

  export const FARM_EVENTS_PANEL =
    trim(`This is the events panel. Here you can view and manage all of
    your scheduled events. Clicking a event will open up the event details
    panel where you can edit it.`);

  export const POINTS_PANEL =
    trim(`This is the points panel. Here you can view and manage all of the
    points in your garden. Clicking a point will open up the point details
    panel where you can edit it.`);

  export const WEEDS_PANEL =
    trim(`This is the weeds panel. Here you can view and manage all of the
    weeds in your garden. Clicking a weed will open up the weed details panel
    where you can edit it.`);

  export const CONTROLS_PANEL =
    trim(`This is the controls panel. Here you can control and view
    current status information about your FarmBot.`);

  export const PHOTOS_PANEL =
    trim(`This is the photos panel. Here you can view and manage all of the
    photos of your garden.`);

  export const TOOLS_PANEL =
    trim(`This is the tools panel. Here you can view and manage all of the
    tools in your garden. Clicking a tool will open up the tool details panel
    where you can edit it.`);

  export const MESSAGES_PANEL =
    trim(`This is the messages panel. Here you can view and manage setup
    cards and announcements.`);

  export const HELP_PANEL =
    trim(`This is the help panel. Here you can browse the documentation or
    get support if you need it.`);

  export const SETTINGS_PANEL =
    trim(`This is the settings panel. Here you can view and manage all of
    your FarmBot and account settings.`);

  export const ADD_PLANTS =
    trim(`Add plants by pressing the + button and searching for a plant,
    selecting one, and dragging it into the garden.`);

  export const ADD_TOOLS =
    trim(`Press the + button to add tools and seed containers.`);

  export const ADD_SEED_CONTAINERS =
    trim(`Press the + button to add seed containers.`);

  export const ADD_TOOLS_AND_SLOTS =
    trim(`Press the + button to add tools and seed containers. Then create
    slots for them to by pressing the slot + button.`);

  export const ADD_SEED_CONTAINERS_AND_SLOTS =
    trim(`Press the + button to add seed containers. Then create
    slots for them to by pressing the slot + button.`);

  export const ADD_TOOLS_SLOTS =
    trim(`Add the newly created tools and seed containers to the
    corresponding slots on FarmBot:
    press the + button to create a slot.`);

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

export namespace SetupWizardContent {
  export const INTRO =
    trim(`Welcome to the setup wizard. This process will guide you through
    the steps necessary to get your FarmBot set up and running. Each step
    will include an action to perform and a question about the outcome, which
    can be answered yes or no. Answering yes will continue to the next step,
    while answering no will display a list of results that can be selected for
    specific troubleshooting tips.`);

  export const SEED_DATA =
    trim(`Once you make a selection, we'll automatically add some
    tools, sensors, peripherals, sequences, and more to get you up
    and running faster.`);

  export const OFFLINE =
    trim(`Unable to connect to FarmBot. Please reconnect FarmBot to continue.`);

  export const NO_SETUP_NETWORK =
    trim(`Try waiting three minutes from power on. Check the Raspberry
    Pi power LED. Check that the SD is fully inserted. Try downloading a new
    FarmBot OS image, ensuring that the device model is correct. Try
    re-flashing the SD card via Etcher. If possible, ensure line-of-sight
    between devices when trying to connect.`);

  export const FIND_MAP_ORIGIN =
    trim(`Find the origin in the map. The origin is at the coordinate (0, 0),
    with arrows pointing along the X and Y axes.`);

  export const PRESS_RIGHT_JOG_BUTTON =
    trim(`Standing from where you will normally view the FarmBot,
    **press the right arrow button**.`);

  export const PRESS_UP_JOG_BUTTON =
    trim(`Standing from where you will normally view the FarmBot,
    **press the up arrow button**.`);

  export const PRESS_DOWN_JOG_BUTTON =
    trim(`Standing from where you will normally view the FarmBot,
    **press the z-axis down arrow button**.`);

  export const NO_MOTOR_MOVEMENT =
    trim(`It made sounds like it was trying to move, but didn't move`);

  export const NO_MOTOR_ACTIVITY =
    trim(`Check motor cable connections. Try again while observing
    electronics box LED activity.`);

  export const X_HOME_PROMPT =
    trim(`Are FarmBot's gantry wheel plates touching the hardstops at the
    end of the tracks?`);

  export const HOME_X =
    trim(`Press the home button or move FarmBot's x-axis (with the controls
    or manually) until the plates hit the hardstops.`);

  export const Y_HOME_PROMPT =
    trim(`Is FarmBot's cross-slide plate touching the hardstop at the end of
    the gantry main beam?`);

  export const HOME_Y =
    trim(`Press the home button or move FarmBot's y-axis (with the controls
      or manually) until the plate hits the hardstop.`);

  export const Z_HOME_PROMPT =
    trim(`Is FarmBot's z-axis hardstop touching the cross-slide plate?`);

  export const HOME_Z =
    trim(`Press the home button or move FarmBot's z-axis (with the controls
      or manually) until the plate hits the hardstop.`);

  export const TOGGLE_PERIPHERAL =
    trim(`Press the {{ toggle }} toggle, wait a few seconds, and then press
    the toggle again.`);

  export const PROBLEM_GETTING_IMAGE =
    trim(`There is a 'camera not detected' or 'problem getting image' error
    log`);

  export const CAMERA_CALIBRATION_PREPARATION =
    trim(`To prepare for camera calibration, move the z-axis all the way up.`);

  export const CAMERA_CALIBRATION =
    trim(`Camera calibration allows correct photo rotation and placement
    in the Farm Designer map. Place the camera calibration card on the soil
    underneath the camera with the side shown below face up. The card must
    be fully visible to the camera.`);

  export const CAMERA_VOLTAGE_LOW =
    trim(`Camera voltage may be low. Try a different Raspberry Pi USB
    power cable.`);

  export const CONFIGURATOR_CONNECTION_PROMPT =
    trim(`Is your phone or computer connected to the FarmBot WiFi network?`);

  export const CHECK_CAMERA_CABLE =
    trim(`Check that the camera is plugged in to a Raspberry Pi USB port
    and ensure that all connectors are securely fastened.`);

  export const BLACK_IMAGE =
    trim(`Ensure that the camera lens is not covered and there is adequate
    lighting. Try unplugging the camera and plugging it back in.`);

  export const CAMERA_REPLACEMENT =
    trim(`If the problem persists after performing the recommendations
    above, you may have a defective camera. You can request a free
    replacement`);

  export const RED_DOTS =
    trim(`Try an alternate calibration method. Two red objects spaced 100mm
    apart can be used in place of the card.`);

  export const CAMERA_ALIGNMENT =
    trim(`Find a detail in the image where the coordinates are known
    (for example, a spot watered by FarmBot), and compare the known
    coordinates against the location for the detail shown in the map.`);

  export const CHECK_TOOL_CONNECTIONS =
    trim(`Check the UTM to tool electrical connections. Ensure pin jumpers
    are installed across the Farmduino UTM pins.`);

  export const READ_SOIL_SENSOR =
    trim(`Attach the soil sensor tool to the UTM and press the READ SENSOR
    for the SOIL MOISTURE sensor.`);
}

export enum DeviceSetting {
  axisHeadingLabels = ``,

  // FarmBot
  farmbotSettings = `FarmBot`,
  name = `name`,
  orderNumber = `Order Number`,
  timezone = `timezone`,
  time_zone = `time zone`,
  camera = `camera`,
  osUpdateTime = `update time`,
  osAutoUpdate = `auto update`,
  farmbotOS = `Farmbot OS`,
  bootSequence = `Boot Sequence`,

  // Firmware
  firmwareSection = `Firmware`,
  firmware = `Firmware`,
  restartFirmware = `Restart Firmware`,
  flashFirmware = `Flash firmware`,

  // Power and Reset
  powerAndReset = `Power and Reset`,
  restartFarmbot = `Restart Farmbot`,
  shutdownFarmbot = `Shutdown Farmbot`,
  softReset = `Soft Reset`,
  hardReset = `Hard Reset`,
  autoSoftReset = `Automatic Soft Reset`,
  connectionAttemptPeriod = `Connection Attempt Period`,
  changeOwnership = `Change Ownership`,

  // Axes
  axisSettings = `Axes`,
  findHome = `Find Home`,
  setHome = `Set Home`,
  findHomeOnBoot = `Find Home on Boot`,
  stopAtHome = `Stop at Home`,
  stopAtMax = `Stop at Max`,
  negativeCoordinatesOnly = `Negative Coordinates Only`,
  findAxisLength = `Find axis length (mm)`,
  calibrationRetries = `Calibration retries`,
  axisLength = `Set Axis Length (mm)`,
  safeHeight = `Safe Height`,
  soilHeight = `Soil Height`,

  // Motors
  motors = `Motors`,
  maxSpeed = `Max Speed (mm/s)`,
  maxSpeedTowardHome = `Max Speed toward home (mm/s)`,
  homingSpeed = `Homing Speed (mm/s)`,
  minimumSpeed = `Minimum Speed (mm/s)`,
  minimumSpeedTowardHome = `Minimum Speed toward home (mm/s)`,
  accelerateFor = `Accelerate for (mm)`,
  accelerateForTowardHome = `Accelerate for toward home (mm)`,
  stepsPerMm = `Steps per MM`,
  microstepsPerStep = `Microsteps per step`,
  alwaysPowerMotors = `Always Power Motors`,
  invertMotors = `Invert Motors`,
  motorCurrent = `Motor Current`,
  enable2ndXMotor = `Enable 2nd X Motor`,
  invert2ndXMotor = `Invert 2nd X Motor`,

  // Encoders / Stall Detection
  encoders = `Encoders`,
  stallDetection = `Stall Detection`,
  stallDetectionNote = `Stall Detection note`,
  enableEncoders = `Enable Encoders`,
  enableStallDetection = `Enable Stall Detection`,
  stallSensitivity = `Stall Sensitivity`,
  useEncodersForPositioning = `Use Encoders for Positioning`,
  invertEncoders = `Invert Encoders`,
  maxMissedSteps = `Max Missed Steps`,
  maxMotorLoad = `Max Motor Load`,
  missedStepDecay = `Missed Step Decay`,
  gracePeriod = `Grace Period`,
  encoderScaling = `Encoder Scaling`,

  // Limit Switches
  limitSwitchSettings = `Limit Switches`,
  limitSwitchesWarning = `Limit switches warning`,
  enableLimitSwitches = `Enable limit switches`,
  swapLimitSwitches = `Swap limit switches`,
  invertLimitSwitches = `Invert limit switches`,

  // Error Handling
  errorHandling = `Error Handling`,
  timeoutAfter = `Timeout after (seconds)`,
  maxRetries = `Max Retries`,
  estopOnMovementError = `E-Stop on Movement Error`,

  // Pin Bindings
  pinBindings = `Pin Bindings`,
  stockPinBindings = `Stock pin bindings`,
  savedPinBindings = `Saved pin bindings`,
  addNewPinBinding = `Add new pin binding`,

  // Pin Guard
  pinGuard = `Pin Guard`,
  pinGuard1 = `Pin Guard 1`,
  pinGuard2 = `Pin Guard 2`,
  pinGuard3 = `Pin Guard 3`,
  pinGuard4 = `Pin Guard 4`,
  pinGuard5 = `Pin Guard 5`,

  // Parameter Management
  parameterManagement = `Parameter Management`,
  paramLoadProgress = `Parameter load progress`,
  paramResend = `Resend parameters`,
  exportParameters = `Export parameters`,
  importParameters = `Import parameters`,
  highlightSettingsModifiedFromDefault = `Highlight settings modified from default`,
  showAdvancedSettings = `Show advanced settings`,
  resetHardwareParams = `Reset hardware parameters`,

  // Farm Designer
  farmDesigner = `Farm Designer`,
  animations = `Plant animations`,
  trail = `Virtual FarmBot trail`,
  mapMissedSteps = `FarmBot motor load`,
  dynamicMap = `Dynamic map size`,
  mapSize = `Map size`,
  rotateMap = `Rotate map`,
  mapOrigin = `Map origin`,
  cropMapImages = `Crop map images`,
  showCameraViewAreaInMap = `Show camera view area in map`,
  confirmPlantDeletion = `Confirm plant deletion`,

  // Account
  accountSettings = `Account`,
  accountName = `Your Name`,
  accountEmail = `Email`,
  changePassword = `Change password`,
  resetAccount = `Reset account`,
  deleteAccount = `Delete account`,
  exportAccountData = `Export data`,

  otherSettings = `Other`,

  // Map
  showPlants = `Plants`,
  showPlantsMapLayer = `Show Plants Map Layer`,
  showPoints = `Points`,
  showPointsMapLayer = `Show Points Map Layer`,
  showWeeds = `Weeds`,
  showWeedsMapLayer = `Show Weeds Map Layer`,
  showRemovedWeeds = `Show removed`,
  showRemovedWeedsMapLayer = `Show Removed Weeds Map Layer`,
  showSpread = `Spread`,
  showSpreadMapLayer = `Show Spread Map Layer`,
  showFarmbot = `FarmBot`,
  showFarmbotMapLayer = `Show FarmBot Map Layer`,
  showPhotos = `Photos`,
  showPhotosMapLayer = `Show Photos Map Layer`,
  showAreas = `Areas`,
  showAreasMapLayer = `Show Areas Map Layer`,
  showReadings = `Readings`,
  showReadingsMapLayer = `Show Readings Map Layer`,

  // Controls
  invertJogButtonXAxis = `X Axis`,
  invertXAxisJogButton = `Invert X Axis Jog Button`,
  invertJogButtonYAxis = `Y Axis`,
  invertYAxisJogButton = `Invert Y Axis Jog Button`,
  invertJogButtonZAxis = `Z Axis`,
  invertZAxisJogButton = `Invert Z Axis Jog Button`,
  displayScaledEncoderPosition = `Scaled encoder position`,
  displayRawEncoderPosition = `Raw encoder position`,
  swapJogButtonsXAndYAxis = `x and y axis`,
  swapXAndYAxisJogButtons = `swap x and y axis jog buttons`,
  showMotorPositionPlot = `show`,
  showMotorPositionPlotDisplay = `show motor position plot display`,

  // Sequences
  confirmStepDeletion = `Confirm step deletion`,
  confirmSequenceDeletion = `Confirm sequence deletion`,
  showPins = `Show pins`,
  openOptionsByDefault = `Open options by default`,
  discardUnsavedSequenceChanges = `Discard unsaved sequence changes`,
  viewCeleryScript = `View CeleryScript`,

  // Logs
  logFilterLevelSuccess = `show success log messages`,
  logFilterLevelBusy = `show busy log messages`,
  logFilterLevelWarn = `show warn log messages`,
  logFilterLevelError = `show error log messages`,
  logFilterLevelInfo = `show info log messages`,
  logFilterLevelFun = `show fun log messages`,
  logFilterLevelDebug = `show debug log messages`,
  logFilterLevelAssertion = `show assertion log messages`,
  sequenceBeginLogs = `Begin`,
  enableSequenceBeginLogs = `Enable sequence begin logs`,
  sequenceStepLogs = `Steps`,
  enableSequenceStepLogs = `Enable sequence step logs`,
  sequenceCompleteLogs = `Complete`,
  enableSequenceCompleteLogs = `Enable sequence complete logs`,
  firmwareSentLogs = `Sent`,
  enableFirmwareSentLogs = `Enable firmware sent logs`,
  firmwareReceivedLogs = `Received`,
  enableFirmwareReceivedLogs = `Enable firmware received logs`,
  firmwareDebugLogs = `Debug`,
  enableFirmwareDebugLogs = `Enable firmware debug logs`,

  // App
  internationalizeWebApp = `Internationalize Web App`,
  use24hourTimeFormat = `Use 24-hour time format`,
  showSecondsInTime = `Show seconds in time`,
  hideWebcamWidget = `Hide Webcam widget`,
  hideSensorsPanel = `Hide Sensors panel`,
  readSpeakLogsInBrowser = `Read speak logs in browser`,
  discardUnsavedChanges = `Discard Unsaved Changes`,
  confirmEmergencyUnlock = `Confirm emergency unlock`,
  userInterfaceReadOnlyMode = `User Interface Read Only Mode`,

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
    This usually happens because of poor WiFi connectivity in the garden,
    a bad password during configuration, a very long power outage, or
    blocked ports on FarmBot's local network. Please refer IT staff to:`);

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

  export const ARDUINO_DISCONNECTED = trim(`Farmduino firmware is missing or
    is possibly unplugged. Verify FIRMWARE selection matches FarmBot kit
    version or check the USB cable between the Raspberry Pi and the
    Farmduino. Reboot FarmBot after a reconnection. If the issue persists,
    reconfiguration of FarmBot OS may be necessary.`);
}

export enum Actions {

  // Resources
  DESTROY_RESOURCE_START = "DESTROY_RESOURCE_START",
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
  STATUS_UPDATE = "STATUS_UPDATE",
  FETCH_OS_UPDATE_INFO_OK = "FETCH_OS_UPDATE_INFO_OK",
  FETCH_OS_UPDATE_INFO_ERROR = "FETCH_OS_UPDATE_INFO_ERROR",
  FETCH_MIN_OS_FEATURE_INFO_OK = "FETCH_MIN_OS_FEATURE_INFO_OK",
  FETCH_MIN_OS_FEATURE_INFO_ERROR = "FETCH_MIN_OS_FEATURE_INFO_ERROR",
  FETCH_OS_RELEASE_NOTES_OK = "FETCH_OS_RELEASE_NOTES_OK",
  FETCH_OS_RELEASE_NOTES_ERROR = "FETCH_OS_RELEASE_NOTES_ERROR",
  INVERT_JOG_BUTTON = "INVERT_JOG_BUTTON",
  DISPLAY_ENCODER_DATA = "DISPLAY_ENCODER_DATA",
  STASH_STATUS = "STASH_STATUS",

  // Draggable
  PUT_DATA_XFER = "PUT_DATA_XFER",
  DROP_DATA_XFER = "DROP_DATA_XFER",

  // Designer
  SEARCH_QUERY_CHANGE = "SEARCH_QUERY_CHANGE",
  SELECT_POINT = "SELECT_POINT",
  SET_SELECTION_POINT_TYPE = "SET_SELECTION_POINT_TYPE",
  TOGGLE_HOVERED_PLANT = "TOGGLE_HOVERED_PLANT",
  TOGGLE_HOVERED_POINT = "TOGGLE_HOVERED_POINT",
  HOVER_SENSOR_READING = "HOVER_SENSOR_READING",
  HOVER_IMAGE = "HOVER_IMAGE",
  HOVER_PLANT_LIST_ITEM = "HOVER_PLANT_LIST_ITEM",
  HOVER_TOOL_SLOT = "HOVER_TOOL_SLOT",
  OF_SEARCH_RESULTS_START = "OF_SEARCH_RESULTS_START",
  OF_SEARCH_RESULTS_OK = "OF_SEARCH_RESULTS_OK",
  OF_SEARCH_RESULTS_NO = "OF_SEARCH_RESULTS_NO",
  CHOOSE_LOCATION = "CHOOSE_LOCATION",
  SET_DRAWN_POINT_DATA = "SET_DRAWN_POINT_DATA",
  SET_DRAWN_WEED_DATA = "SET_DRAWN_WEED_DATA",
  CHOOSE_SAVED_GARDEN = "CHOOSE_SAVED_GARDEN",
  TRY_SORT_TYPE = "TRY_SORT_TYPE",
  SET_SETTINGS_SEARCH_TERM = "SET_SETTINGS_SEARCH_TERM",
  EDIT_GROUP_AREA_IN_MAP = "EDIT_GROUP_AREA_IN_MAP",
  VISUALIZE_SEQUENCE = "VISUALIZE_SEQUENCE",
  HOVER_SEQUENCE_STEP = "HOVER_SEQUENCE_STEP",
  HIDE_MAP_IMAGE = "HIDE_MAP_IMAGE",
  UN_HIDE_MAP_IMAGE = "UN_HIDE_MAP_IMAGE",
  SET_SHOWN_MAP_IMAGES = "SET_SHOWN_MAP_IMAGES",
  TOGGLE_SHOWN_IMAGES_ONLY = "TOGGLE_SHOWN_IMAGES_ONLY",
  TOGGLE_ALWAYS_HIGHLIGHT_IMAGE = "TOGGLE_ALWAYS_HIGHLIGHT_IMAGE",
  HIGHLIGHT_MAP_IMAGE = "HIGHLIGHT_MAP_IMAGE",
  SHOW_CAMERA_VIEW_POINTS = "SHOW_CAMERA_VIEW_POINTS",
  TOGGLE_GRID_ID = "TOGGLE_GRID_ID",
  TOGGLE_SOIL_HEIGHT_LABELS = "TOGGLE_SOIL_HEIGHT_LABELS",
  SET_PROFILE_OPEN = "SET_PROFILE_OPEN",
  SET_PROFILE_AXIS = "SET_PROFILE_AXIS",
  SET_PROFILE_POSITION = "SET_PROFILE_POSITION",
  SET_PROFILE_WIDTH = "SET_PROFILE_WIDTH",
  SET_PROFILE_FOLLOW_BOT = "SET_PROFILE_FOLLOW_BOT",

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

  // Photos
  SELECT_IMAGE = "SELECT_IMAGE",
  SET_IMAGE_SIZE = "SET_IMAGE_SIZE",

  // Farmware
  SELECT_FARMWARE = "SELECT_FARMWARE",
  FETCH_FIRST_PARTY_FARMWARE_NAMES_OK = "FETCH_FIRST_PARTY_FARMWARE_NAMES_OK",
  SET_FARMWARE_INFO_STATE = "SET_FARMWARE_INFO_STATE",

  // App
  START_TOUR = "START_TOUR",
  SET_TOUR = "SET_TOUR",
  SET_TOUR_STEP = "SET_TOUR_STEP",
  CREATE_TOAST = "CREATE_TOAST",
  REMOVE_TOAST = "REMOVE_TOAST",

  // Network
  NETWORK_EDGE_CHANGE = "NETWORK_EDGE_CHANGE",
  SET_CONSISTENCY = "SET_CONSISTENCY",
  PING_START = "PING_START",
  PING_OK = "PING_OK",
  PING_NO = "PING_NO",

  // Sequence Folders
  FOLDER_TOGGLE = "FOLDER_TOGGLE",
  FOLDER_TOGGLE_ALL = "FOLDER_TOGGLE_ALL",
  FOLDER_TOGGLE_EDIT = "FOLDER_TOGGLE_EDIT",
  FOLDER_SEARCH = "FOLDER_SEARCH"
}
