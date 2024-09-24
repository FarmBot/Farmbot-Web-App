/* eslint-disable max-len */
import { sampleSize } from "lodash";

export const LIB_DIR = "/3D/lib/";

export const ASSETS = {
  fonts: {
    cabinBold: "/3D/fonts/Cabin_Bold.ttf",
  },
  textures: {
    cloud: "/3D/textures/cloud.avif",
    grass: "/3D/textures/grass.avif",
    wood: "/3D/textures/wood.avif",
    soil: "/3D/textures/soil.avif",
    aluminum: "/3D/textures/aluminum.avif",
    concrete: "/3D/textures/concrete.avif",
    screen: "/3D/textures/screen.avif",
  },
  icons: {
    anaheimPepper: "/3D/icons/anaheim_pepper.avif",
    arugula: "/3D/icons/arugula.avif",
    basil: "/3D/icons/basil.avif",
    beet: "/3D/icons/beet.avif",
    bibbLettuce: "/3D/icons/bibb_lettuce.avif",
    bokChoy: "/3D/icons/bok_choy.avif",
    broccoli: "/3D/icons/broccoli.avif",
    brusselsSprout: "/3D/icons/brussels_sprout.avif",
    carrot: "/3D/icons/carrot.avif",
    cauliflower: "/3D/icons/cauliflower.avif",
    celery: "/3D/icons/celery.avif",
    chard: "/3D/icons/swiss_chard.avif",
    cherryBelleRadish: "/3D/icons/cherry_belle_radish.avif",
    cilantro: "/3D/icons/cilantro.avif",
    collardGreens: "/3D/icons/collard_greens.avif",
    cucumber: "/3D/icons/cucumber.avif",
    eggplant: "/3D/icons/eggplant.avif",
    frenchBreakfastRadish: "/3D/icons/french_breakfast_radish.avif",
    garlic: "/3D/icons/garlic.avif",
    goldenBeet: "/3D/icons/golden_beet.avif",
    hillbillyTomato: "/3D/icons/hillbilly_tomato.avif",
    icicleRadish: "/3D/icons/icicle_radish.avif",
    lacinatoKale: "/3D/icons/lacinato_kale.avif",
    leek: "/3D/icons/leek.avif",
    napaCabbage: "/3D/icons/napa_cabbage.avif",
    okra: "/3D/icons/okra.avif",
    parsnip: "/3D/icons/parsnip.avif",
    rainbowChard: "/3D/icons/rainbow_chard.avif",
    redBellPepper: "/3D/icons/red_bell_pepper.avif",
    redCurlyKale: "/3D/icons/red_curly_kale.avif",
    redRussianKale: "/3D/icons/red_russian_kale.avif",
    runnerBean: "/3D/icons/runner_bean.avif",
    rutabaga: "/3D/icons/rutabaga.avif",
    savoyCabbage: "/3D/icons/savoy_cabbage.avif",
    shallot: "/3D/icons/shallot.avif",
    snapPea: "/3D/icons/snap_pea.avif",
    spinach: "/3D/icons/spinach.avif",
    sweetPotato: "/3D/icons/sweet_potato.avif",
    turmeric: "/3D/icons/turmeric.avif",
    turnip: "/3D/icons/turnip.avif",
    yellowOnion: "/3D/icons/yellow_onion.avif",
    zucchini: "/3D/icons/zucchini.avif",
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
    ccHorizontal: "/3D/models/cc_horizontal.glb",
    ccVertical: "/3D/models/cc_vertical.glb",
    housingVertical: "/3D/models/housing_vertical.glb",
    horizontalMotorHousing: "/3D/models/horizontal_motor_housing.glb",
    zAxisMotorMount: "/3D/models/z_axis_motor_mount.glb",
    toolbay3: "/3D/models/toolbay_3.glb",
    rotaryTool: "/3D/models/rotary_tool.glb",
    seeder: "/3D/models/seeder.glb",
    seedTray: "/3D/models/seed_tray.glb",
    seedBin: "/3D/models/seed_bin.glb",
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
  },
  people: {
    person1: "/3D/people/person_1.avif",
    person1Flipped: "/3D/people/person_1_flipped.avif",
    person2: "/3D/people/person_2.avif",
    person2Flipped: "/3D/people/person_2_flipped.avif",
  },
};

interface Plant {
  label: string;
  icon: string;
  spread: number;
  size: number;
}

interface Gardens {
  [key: string]: string[];
}

export const PLANTS: Record<string, Plant> = {
  anaheimPepper: {
    label: "Anaheim Pepper",
    icon: ASSETS.icons.anaheimPepper,
    spread: 400,
    size: 150,
  },
  arugula: {
    label: "Arugula",
    icon: ASSETS.icons.arugula,
    spread: 250,
    size: 180,
  },
  basil: {
    label: "Basil",
    icon: ASSETS.icons.basil,
    spread: 250,
    size: 160,
  },
  beet: {
    label: "Beet",
    icon: ASSETS.icons.beet,
    spread: 175,
    size: 150,
  },
  bibbLettuce: {
    label: "Bibb Lettuce",
    icon: ASSETS.icons.bibbLettuce,
    spread: 250,
    size: 200,
  },
  bokChoy: {
    label: "Bok Choy",
    icon: ASSETS.icons.bokChoy,
    spread: 210,
    size: 160,
  },
  broccoli: {
    label: "Broccoli",
    icon: ASSETS.icons.broccoli,
    spread: 375,
    size: 250,
  },
  brusselsSprout: {
    label: "Brussels Sprout",
    icon: ASSETS.icons.brusselsSprout,
    spread: 300,
    size: 250,
  },
  carrot: {
    label: "Carrot",
    icon: ASSETS.icons.carrot,
    spread: 150,
    size: 125,
  },
  cauliflower: {
    label: "Cauliflower",
    icon: ASSETS.icons.cauliflower,
    spread: 400,
    size: 250,
  },
  celery: {
    label: "Celery",
    icon: ASSETS.icons.celery,
    spread: 350,
    size: 200,
  },
  chard: {
    label: "Swiss Chard",
    icon: ASSETS.icons.chard,
    spread: 300,
    size: 300,
  },
  cherryBelleRadish: {
    label: "Cherry Belle Radish",
    icon: ASSETS.icons.cherryBelleRadish,
    spread: 100,
    size: 100,
  },
  cilantro: {
    label: "Cilantro",
    icon: ASSETS.icons.cilantro,
    spread: 180,
    size: 150,
  },
  collardGreens: {
    label: "Collard Greens",
    icon: ASSETS.icons.collardGreens,
    spread: 230,
    size: 230,
  },
  cucumber: {
    label: "Cucumber",
    icon: ASSETS.icons.cucumber,
    spread: 400,
    size: 200,
  },
  eggplant: {
    label: "Eggplant",
    icon: ASSETS.icons.eggplant,
    spread: 400,
    size: 200,
  },
  frenchBreakfastRadish: {
    label: "French Breakfast Radish",
    icon: ASSETS.icons.frenchBreakfastRadish,
    spread: 100,
    size: 100,
  },
  garlic: {
    label: "Garlic",
    icon: ASSETS.icons.garlic,
    spread: 175,
    size: 100,
  },
  goldenBeet: {
    label: "Golden Beet",
    icon: ASSETS.icons.goldenBeet,
    spread: 175,
    size: 150,
  },
  hillbillyTomato: {
    label: "Hillbilly Tomato",
    icon: ASSETS.icons.hillbillyTomato,
    spread: 400,
    size: 200,
  },
  icicleRadish: {
    label: "Icicle Radish",
    icon: ASSETS.icons.icicleRadish,
    spread: 100,
    size: 100,
  },
  lacinatoKale: {
    label: "Lacinato Kale",
    icon: ASSETS.icons.lacinatoKale,
    spread: 250,
    size: 220,
  },
  leek: {
    label: "Leek",
    icon: ASSETS.icons.leek,
    spread: 200,
    size: 200,
  },
  napaCabbage: {
    label: "Napa Cabbage",
    icon: ASSETS.icons.napaCabbage,
    spread: 400,
    size: 220,
  },
  okra: {
    label: "Okra",
    icon: ASSETS.icons.okra,
    spread: 400,
    size: 200,
  },
  parsnip: {
    label: "Parsnip",
    icon: ASSETS.icons.parsnip,
    spread: 180,
    size: 120,
  },
  rainbowChard: {
    label: "Rainbow Chard",
    icon: ASSETS.icons.rainbowChard,
    spread: 250,
    size: 250,
  },
  redBellPepper: {
    label: "Red Bell Pepper",
    icon: ASSETS.icons.redBellPepper,
    spread: 350,
    size: 200,
  },
  redCurlyKale: {
    label: "Red Curly Kale",
    icon: ASSETS.icons.redCurlyKale,
    spread: 350,
    size: 220,
  },
  redRussianKale: {
    label: "Red Russian Kale",
    icon: ASSETS.icons.redRussianKale,
    spread: 250,
    size: 200,
  },
  runnerBean: {
    label: "Runner Bean",
    icon: ASSETS.icons.runnerBean,
    spread: 350,
    size: 200,
  },
  rutabaga: {
    label: "Rutabaga",
    icon: ASSETS.icons.rutabaga,
    spread: 200,
    size: 150,
  },
  savoyCabbage: {
    label: "Savoy Cabbage",
    icon: ASSETS.icons.savoyCabbage,
    spread: 400,
    size: 250,
  },
  shallot: {
    label: "Shallot",
    icon: ASSETS.icons.shallot,
    spread: 200,
    size: 140,
  },
  snapPea: {
    label: "Snap Pea",
    icon: ASSETS.icons.snapPea,
    spread: 200,
    size: 150,
  },
  spinach: {
    label: "Spinach",
    icon: ASSETS.icons.spinach,
    spread: 250,
    size: 200,
  },
  sweetPotato: {
    label: "Sweet Potato",
    icon: ASSETS.icons.sweetPotato,
    spread: 400,
    size: 180,
  },
  turmeric: {
    label: "Turmeric",
    icon: ASSETS.icons.turmeric,
    spread: 250,
    size: 150,
  },
  turnip: {
    label: "Turnip",
    icon: ASSETS.icons.turnip,
    spread: 175,
    size: 150,
  },
  yellowOnion: {
    label: "Yellow Onion",
    icon: ASSETS.icons.yellowOnion,
    spread: 200,
    size: 150,
  },
  zucchini: {
    label: "Zucchini",
    icon: ASSETS.icons.zucchini,
    spread: 400,
    size: 250,
  },
};

export const GARDENS: Gardens = {
  "Spring": [
    "beet", "bibbLettuce", "broccoli", "carrot", "cauliflower", "rainbowChard",
    "icicleRadish", "redRussianKale", "bokChoy", "spinach", "snapPea",
  ],
  "Summer": [
    "anaheimPepper", "basil", "cucumber", "eggplant", "hillbillyTomato", "okra",
    "redBellPepper", "runnerBean", "sweetPotato", "zucchini",
  ],
  "Fall": [
    "arugula", "cherryBelleRadish", "cilantro", "collardGreens", "garlic",
    "goldenBeet", "leek", "lacinatoKale", "turnip", "yellowOnion",
  ],
  "Winter": [
    "frenchBreakfastRadish", "napaCabbage", "parsnip", "redCurlyKale",
    "rutabaga", "savoyCabbage", "shallot", "turmeric", "celery", "brusselsSprout",
  ],
  "Random": sampleSize(Object.keys(PLANTS), 20),
};

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
  ccHorizontal = "60mm_Horizontal_Cable_Carrier_Support",
  ccVertical = "60mm_Vertical_Cable_Carrier_Support",
  housingVertical = "80mm_Vertical_Motor_Housing",
  horizontalMotorHousing = "75mm_Horizontal_Motor_Housing",
  zAxisMotorMount = "Z-Axis_Motor_Mount",
  toolbay3 = "mesh0_mesh",
  toolbay3Logo = "mesh0_mesh_1",
  seeder = "Seeder_Brass_Insert",
  vacuumPump = "Lower_Vacuum_Tube",
  wateringNozzle = "M5_x_30mm_Screw",
  seedBin = "Seed_Bin",
  seedTray = "Seed_Tray",
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
