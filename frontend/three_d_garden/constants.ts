import { Mode } from "../farm_designer/map/interfaces";

export enum BigDistance {
  sunAffect = 20000,
  sunVisual = 31000,
  sunActual = 10000,
  sky = 40000,
  ground = 30000,
  far = 75000,
  zoom = 20000,
  devZoom = 37000,
}

export const LIB_DIR = "/3D/lib/";

export const ASSETS: Record<string, Record<string, string>> = {
  fonts: {
    cabinBold: "/3D/fonts/Cabin_Bold.json",
  },
  textures: {
    cloud: "/3D/textures/cloud.avif",
    grass: "/3D/textures/grass.avif",
    wood: "/3D/textures/wood.avif",
    soil: "/3D/textures/soil.avif",
    aluminum: "/3D/textures/aluminum.avif",
    concrete: "/3D/textures/concrete.avif",
    screen: "/3D/textures/screen.avif",
    bricks: "/3D/textures/bricks.avif",
    water: "/3D/textures/water.avif",
  },
  shapes: {
    track: "/3D/shapes/track.svg",
    column: "/3D/shapes/column.svg",
    beam: "/3D/shapes/beam.svg",
    zAxis: "/3D/shapes/z_axis.svg",
  },
  models: {
    gantryWheelPlate: "/3D/models/gantry_wheel_plate.glb",
    leftBracket: "/3D/models/left_bracket.glb",
    rightBracket: "/3D/models/right_bracket.glb",
    crossSlide: "/3D/models/cross_slide.glb",
    beltClip: "/3D/models/belt_clip.glb",
    zStop: "/3D/models/z_stop.glb",
    utm: "/3D/models/utm.glb",
    ccSupportHorizontal: "/3D/models/cc_support_horizontal.glb",
    ccSupportVertical: "/3D/models/cc_support_vertical.glb",
    housingVertical: "/3D/models/housing_vertical.glb",
    horizontalMotorHousing: "/3D/models/horizontal_motor_housing.glb",
    zAxisMotorMount: "/3D/models/z_axis_motor_mount.glb",
    toolbay3: "/3D/models/toolbay_3.glb",
    toolbay1: "/3D/models/toolbay_1.glb",
    rotaryToolBase: "/3D/models/rotary_tool_base.glb",
    rotaryToolImplement: "/3D/models/rotary_tool_implement.glb",
    seeder: "/3D/models/seeder.glb",
    weeder: "/3D/models/weeder.glb",
    seedTray: "/3D/models/seed_tray.glb",
    seedBin: "/3D/models/seed_bin.glb",
    seedTrough: "/3D/models/seed_trough.glb",
    seedTroughAssembly: "/3D/models/seed_trough_assembly.glb",
    seedTroughHolder: "/3D/models/seed_trough_holder.glb",
    soilSensor: "/3D/models/soil_sensor.glb",
    wateringNozzle: "/3D/models/watering_nozzle.glb",
    vacuumPumpCover: "/3D/models/vacuum_pump_cover.glb",
    pi: "/3D/models/pi.glb",
    farmduino: "/3D/models/farmduino.glb",
    cameraMountHalf: "/3D/models/camera_mount_half.glb",
    solenoid: "/3D/models/solenoid.glb",
    xAxisCCMount: "/3D/models/x_axis_cc_mount.glb",
    box: "/3D/models/box.glb",
    btn: "/3D/models/push_button.glb",
    led: "/3D/models/led_indicator.glb",
  },
  other: {
    gear: "/app-resources/img/icons/settings.svg",
    weed: "/3D/icons/generic-weed.avif",
    plant: "/3D/icons/generic-plant.avif",
  },
  people: {
    person1: "/3D/people/person_1.avif",
    person1Flipped: "/3D/people/person_1_flipped.avif",
    person2: "/3D/people/person_2.avif",
    person2Flipped: "/3D/people/person_2_flipped.avif",
    person3: "/3D/people/person_3.avif",
    person3Flipped: "/3D/people/person_3_flipped.avif",
    person4: "/3D/people/person_4.avif",
    person4Flipped: "/3D/people/person_4_flipped.avif",
  },
};

export const HOVER_OBJECT_MODES = [
  Mode.clickToAdd,
  Mode.createPoint,
  Mode.createWeed,
];
export const DRAW_POINT_MODES = [
  Mode.createPoint,
  Mode.createWeed,
];

export enum SeedTroughAssemblyMaterial {
  zero = "0.800000_0.800000_0.800000_0.000000_0.000000",
  one = "0.400000_0.400000_0.400000_0.000000_0.000000",
  two = "0.603922_0.647059_0.686275_0.000000_0.000000",
}

export enum SeedTroughHolderMaterial {
  zero = "0.603922_0.647059_0.686275_0.000000_0.000000",
  one = "0.800000_0.800000_0.800000_0.000000_0.000000",
}

export enum VacuumPumpCoverMaterial {
  zero = "0.800000_0.800000_0.800000_0.000000_0.000000",
  one = "0.603922_0.647059_0.686275_0.000000_0.000000",
}

export enum PartName {
  gantryWheelPlate = "Gantry_Wheel_Plate",
  leftBracket = "Left_Gantry_Corner_Bracket",
  rightBracket = "Right_Gantry_Corner_Bracket",
  crossSlide = "Cross-Slide_Plate",
  zStop = "Z-Axis_Hardstop",
  beltClip = "Belt_Clip_-_Slim",
  utm = "M5_Barb",
  ccSupportHorizontal = "60mm_Horizontal_Cable_Carrier_Support",
  ccSupportVertical = "60mm_Vertical_Cable_Carrier_Support",
  housingVertical = "80mm_Vertical_Motor_Housing",
  horizontalMotorHousing = "75mm_Horizontal_Motor_Housing",
  zAxisMotorMount = "Z-Axis_Motor_Mount",
  toolbay3 = "mesh0_mesh",
  toolbay3Logo = "mesh0_mesh_1",
  toolbay1 = "mesh0_mesh",
  toolbay1Logo = "mesh0_mesh_1",
  seeder = "Seeder_Brass_Insert",
  weeder = "Weeder_Blade_(medium)",
  vacuumPump = "Lower_Vacuum_Tube",
  wateringNozzle = "M5_x_30mm_Screw",
  seedBin = "Seed_Bin",
  seedTray = "Seed_Tray",
  seedTrough = "Seed_Trough",
  cameraMountHalf = "Camera_Mount_Half",
  pi = "Raspberry_Pi_4B",
  farmduino = "Farmduino",
  solenoid = "200mm_Zip_Tie",
  xAxisCCMount = "X-Axis_CC_Mount",
}

export enum ElectronicsBoxMaterial {
  box = "0.901961_0.901961_0.901961_0.000000_0.000000",
  gasket = "0.301961_0.301961_0.301961_0.000000_0.000000",
  lid = "0.564706_0.811765_0.945098_0.000000_0.623529",
  button = "0.701961_0.701961_0.701961_0.000000_0.000000",
  led = "0.600000_0.600000_0.600000_0.000000_0.000000",
}

export enum RenderOrder {
  default,
  one,
  points,
  weedImages,
  weedSpheres,
  plants,
  plantLabels,
  pointerPlant,
  beacons,
  clouds,
}
