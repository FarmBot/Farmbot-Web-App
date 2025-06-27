export interface Config {
  sizePreset: string;
  bedType: string;
  otherPreset: string;
  label: string;
  botSizeX: number;
  botSizeY: number;
  botSizeZ: number;
  bedWallThickness: number;
  bedHeight: number;
  ccSupportSize: number;
  x: number;
  y: number;
  z: number;
  beamLength: number;
  columnLength: number;
  zAxisLength: number;
  bedXOffset: number;
  bedYOffset: number;
  bedZOffset: number;
  zGantryOffset: number;
  bedWidthOuter: number;
  bedLengthOuter: number;
  legSize: number;
  legsFlush: boolean;
  extraLegsX: number;
  extraLegsY: number;
  bedBrightness: number;
  soilBrightness: number;
  soilHeight: number;
  soilSurface: string;
  soilSurfacePointCount: number;
  soilSurfaceVariance: number;
  showSoilPoints: boolean;
  plants: string;
  labels: boolean;
  labelsOnHover: boolean;
  ground: boolean;
  grid: boolean;
  axes: boolean;
  trail: boolean;
  tracks: boolean;
  clouds: boolean;
  sunInclination: number;
  sunAzimuth: number;
  heading: number;
  perspective: boolean;
  bot: boolean;
  laser: boolean;
  tool: string;
  cableCarriers: boolean;
  viewCube: boolean;
  stats: boolean;
  config: boolean;
  urlParamAutoAdd: boolean;
  zoom: boolean;
  pan: boolean;
  rotate: boolean;
  bounds: boolean;
  threeAxes: boolean;
  xyDimensions: boolean;
  zDimension: boolean;
  promoInfo: boolean;
  settingsBar: boolean;
  zoomBeacons: boolean;
  solar: boolean;
  utilitiesPost: boolean;
  packaging: boolean;
  lab: boolean;
  people: boolean;
  scene: string;
  lowDetail: boolean;
  eventDebug: boolean;
  cableDebug: boolean;
  zoomBeaconDebug: boolean;
  lightsDebug: boolean;
  sun: number;
  ambient: number;
  animate: boolean;
  animateSeasons: boolean;
  distanceIndicator: string;
  kitVersion: string;
  negativeZ: boolean;
  exaggeratedZ: boolean;
  waterFlow: boolean;
  light: boolean;
  vacuum: boolean;
  rotary: number;
  north: boolean;
  desk: boolean;
}

export const INITIAL: Config = {
  sizePreset: "Genesis",
  bedType: "Standard",
  otherPreset: "Initial",
  label: "FarmBot Genesis",
  botSizeX: 2720,
  botSizeY: 1230,
  botSizeZ: 500,
  bedWallThickness: 40,
  bedHeight: 300,
  ccSupportSize: 50,
  x: 300,
  y: 700,
  z: 200,
  beamLength: 1500,
  columnLength: 500,
  zAxisLength: 1000,
  bedXOffset: 140,
  bedYOffset: 20,
  bedZOffset: 0,
  zGantryOffset: 140,
  bedWidthOuter: 1360,
  bedLengthOuter: 3000,
  legSize: 100,
  legsFlush: true,
  extraLegsX: 1,
  extraLegsY: 0,
  bedBrightness: 8,
  soilBrightness: 12,
  soilHeight: 500,
  soilSurface: "random",
  soilSurfacePointCount: 25,
  soilSurfaceVariance: 75,
  showSoilPoints: false,
  plants: "Spring",
  labels: false,
  labelsOnHover: false,
  ground: true,
  grid: true,
  axes: false,
  trail: false,
  tracks: true,
  clouds: true,
  sunInclination: 140,
  sunAzimuth: 230,
  heading: 0,
  perspective: true,
  bot: true,
  laser: false,
  tool: "rotaryTool",
  cableCarriers: true,
  viewCube: false,
  stats: false,
  config: false,
  urlParamAutoAdd: false,
  zoom: false,
  pan: false,
  rotate: true,
  bounds: false,
  threeAxes: false,
  xyDimensions: false,
  zDimension: false,
  promoInfo: true,
  settingsBar: true,
  zoomBeacons: true,
  solar: false,
  utilitiesPost: true,
  packaging: false,
  lab: false,
  people: false,
  scene: "Outdoor",
  lowDetail: false,
  eventDebug: false,
  cableDebug: false,
  zoomBeaconDebug: false,
  lightsDebug: false,
  sun: 75,
  ambient: 75,
  animate: true,
  animateSeasons: false,
  distanceIndicator: "",
  kitVersion: "v1.7",
  negativeZ: false,
  exaggeratedZ: false,
  waterFlow: false,
  light: false,
  vacuum: false,
  rotary: 0,
  north: false,
  desk: true,
};

export const STRING_KEYS = [
  "sizePreset", "bedType", "otherPreset", "label", "plants", "tool", "scene",
  "distanceIndicator", "kitVersion", "soilSurface",
];

export const NUMBER_KEYS = [
  "botSizeX", "botSizeY", "botSizeZ", "bedWallThickness", "bedHeight",
  "ccSupportSize", "x", "y", "z", "beamLength", "columnLength", "zAxisLength",
  "bedXOffset", "bedYOffset", "bedZOffset", "zGantryOffset", "bedWidthOuter",
  "bedLengthOuter", "legSize", "extraLegsX", "extraLegsY", "bedBrightness",
  "soilBrightness", "soilHeight", "sunInclination", "sunAzimuth", "heading",
  "soilSurfacePointCount", "soilSurfaceVariance", "sun", "ambient", "rotary",
];

export const BOOLEAN_KEYS = [
  "legsFlush", "labels", "labelsOnHover", "ground", "grid", "axes", "trail",
  "tracks", "clouds", "perspective", "bot", "laser", "cableCarriers",
  "viewCube", "stats", "config", "zoom", "pan", "rotate", "bounds", "threeAxes",
  "xyDimensions", "zDimension", "promoInfo", "settingsBar", "zoomBeacons",
  "solar", "utilitiesPost", "packaging", "lab", "people", "lowDetail",
  "eventDebug", "cableDebug", "zoomBeaconDebug", "lightsDebug",
  "animate", "animateSeasons", "negativeZ",
  "waterFlow", "exaggeratedZ", "showSoilPoints", "urlParamAutoAdd",
  "light", "vacuum", "north", "desk",
];

export const PRESETS: Record<string, Config> = {
  "Jr": {
    ...INITIAL,
    sizePreset: "Jr",
    bedType: "Standard",
    label: "FarmBot Jr",
    botSizeX: 620,
    botSizeY: 220,
    botSizeZ: 250,
    beamLength: 550,
    columnLength: 300,
    zAxisLength: 750,
    bedXOffset: 140,
    bedYOffset: 80,
    zGantryOffset: 140,
    bedWidthOuter: 400,
    bedLengthOuter: 900,
    extraLegsX: 0,
    extraLegsY: 0,
    soilHeight: 280,
    tracks: true,
    soilSurfacePointCount: 5,
  },
  "Genesis": {
    ...INITIAL,
    sizePreset: "Genesis",
    bedType: "Standard",
    label: "FarmBot Genesis",
    botSizeX: 2720,
    botSizeY: 1230,
    botSizeZ: 500,
    beamLength: 1500,
    columnLength: 500,
    zAxisLength: 1000,
    bedXOffset: 140,
    bedYOffset: 20,
    zGantryOffset: 140,
    bedWidthOuter: 1360,
    bedLengthOuter: 3000,
    extraLegsX: 1,
    extraLegsY: 0,
    soilHeight: 500,
    tracks: true,
    soilSurfacePointCount: 25,
  },
  "Genesis XL": {
    ...INITIAL,
    sizePreset: "Genesis XL",
    bedType: "Standard",
    label: "FarmBot Genesis XL",
    botSizeX: 5720,
    botSizeY: 2730,
    botSizeZ: 500,
    beamLength: 3000,
    columnLength: 500,
    zAxisLength: 1000,
    bedXOffset: 140,
    bedYOffset: 20,
    zGantryOffset: 140,
    bedWidthOuter: 2860,
    bedLengthOuter: 6000,
    extraLegsX: 3,
    extraLegsY: 1,
    soilHeight: 500,
    tracks: true,
    soilSurfacePointCount: 100,
  },
  "Initial": INITIAL,
  "Minimal": {
    ...INITIAL,
    bedWallThickness: 40,
    bedHeight: 300,
    x: 300,
    y: 200,
    z: 200,
    ccSupportSize: 50,
    legSize: 100,
    legsFlush: false,
    bedBrightness: 8,
    soilBrightness: 12,
    plants: "",
    labels: false,
    labelsOnHover: false,
    ground: true,
    grid: false,
    axes: false,
    trail: false,
    clouds: false,
    sunInclination: 90,
    sunAzimuth: 0,
    heading: 0,
    perspective: true,
    bot: true,
    laser: false,
    tool: "",
    cableCarriers: true,
    viewCube: false,
    stats: false,
    config: true,
    urlParamAutoAdd: true,
    zoom: true,
    pan: true,
    rotate: true,
    bounds: false,
    threeAxes: false,
    xyDimensions: false,
    zDimension: false,
    promoInfo: false,
    settingsBar: false,
    zoomBeacons: false,
    solar: false,
    utilitiesPost: false,
    packaging: false,
    lab: false,
    people: false,
    scene: "Outdoor",
    lowDetail: false,
    eventDebug: false,
    cableDebug: false,
    zoomBeaconDebug: false,
    animate: true,
    animateSeasons: false,
    distanceIndicator: "",
    north: false,
    desk: false,
  },
  "Maximal": {
    ...INITIAL,
    bedWallThickness: 40,
    bedHeight: 300,
    x: 300,
    y: 200,
    z: 200,
    ccSupportSize: 50,
    legSize: 100,
    legsFlush: true,
    bedBrightness: 8,
    soilBrightness: 12,
    soilSurface: "random",
    soilSurfacePointCount: 50,
    soilSurfaceVariance: 100,
    showSoilPoints: true,
    plants: "Spring",
    labels: true,
    labelsOnHover: false,
    ground: true,
    grid: true,
    axes: true,
    trail: true,
    clouds: true,
    sunInclination: 30,
    sunAzimuth: 45,
    perspective: true,
    bot: true,
    laser: true,
    tool: "",
    cableCarriers: true,
    viewCube: true,
    stats: true,
    config: true,
    urlParamAutoAdd: true,
    zoom: true,
    pan: true,
    rotate: true,
    bounds: true,
    threeAxes: true,
    xyDimensions: true,
    zDimension: true,
    promoInfo: true,
    settingsBar: true,
    zoomBeacons: true,
    solar: true,
    utilitiesPost: true,
    packaging: true,
    lab: true,
    people: true,
    scene: "outdoor",
    lowDetail: false,
    eventDebug: false,
    cableDebug: true,
    zoomBeaconDebug: true,
    lightsDebug: true,
    animate: true,
    animateSeasons: false,
    distanceIndicator: "",
    waterFlow: true,
    light: true,
    vacuum: true,
    rotary: 1,
    exaggeratedZ: true,
    north: true,
    desk: true,
  },
};

const SIZE_CONFIG_KEYS: (keyof Config)[] = [
  "sizePreset", "label", "bedType",
  "botSizeX", "botSizeY", "botSizeZ", "beamLength", "columnLength", "zAxisLength",
  "bedXOffset", "bedYOffset", "zGantryOffset", "bedWidthOuter", "bedLengthOuter",
  "extraLegsX", "extraLegsY", "soilHeight", "tracks", "soilSurfacePointCount",
];

const OTHER_CONFIG_KEYS: (keyof Config)[] = [
  "bedWallThickness", "bedHeight", "x", "y", "z",
  "ccSupportSize", "legSize", "legsFlush",
  "bedBrightness", "soilBrightness", "plants", "labels", "ground", "grid", "axes",
  "trail", "clouds", "sunInclination", "sunAzimuth", "heading",
  "perspective", "bot", "laser",
  "tool", "cableCarriers", "viewCube", "stats", "config", "zoom", "bounds",
  "threeAxes", "xyDimensions", "zDimension", "labelsOnHover", "promoInfo",
  "settingsBar", "zoomBeacons", "pan", "rotate",
  "solar", "utilitiesPost", "packaging", "lab",
  "people", "scene", "lowDetail", "sun", "ambient",
  "eventDebug", "cableDebug", "zoomBeaconDebug", "lightsDebug",
  "animate", "distanceIndicator", "kitVersion", "negativeZ", "waterFlow",
  "light", "vacuum", "rotary", "animateSeasons",
  "exaggeratedZ", "soilSurface", "soilSurfaceVariance",
  "showSoilPoints", "urlParamAutoAdd", "north", "desk",
];

export const modifyConfig = (config: Config, update: Partial<Config>) => {
  const newConfig: Config = { ...config, ...update };
  if (update.sizePreset) {
    const presetConfig = PRESETS[update.sizePreset];
    SIZE_CONFIG_KEYS.map(key => newConfig[key] = presetConfig[key] as never);
    if (update.sizePreset == "Jr") {
      newConfig.x = 100;
      newConfig.y = 100;
      newConfig.z = 50;
    }
  }
  if (update.scene) {
    newConfig.lab = update.scene == "Lab";
    newConfig.clouds = update.scene == "Outdoor";
    newConfig.people = update.scene != "Outdoor";
    newConfig.bedType =
      (update.scene != "Outdoor" && newConfig.sizePreset != "Genesis XL")
        ? "Mobile"
        : "Standard";
  }
  if (update.bedType || (newConfig.bedType != config.bedType)) {
    newConfig.bedZOffset = newConfig.bedType == "Mobile" ? 500 : 0;
    newConfig.legsFlush = newConfig.bedType != "Mobile";
  }
  if (update.otherPreset) {
    if (update.otherPreset == "Reset all") {
      Object.keys(config).map(key => {
        const configKey = key as keyof Config;
        newConfig[configKey] = INITIAL[configKey] as never;
      });
      const url = new URL(window.location.href);
      url.search = "";
      history.pushState(undefined, "", url.toString());
    } else {
      const presetConfig = PRESETS[update.otherPreset];
      OTHER_CONFIG_KEYS.map(key => newConfig[key] = presetConfig[key] as never);
    }
  }
  return newConfig;
};

export const KIT_LOOKUP: { [x: string]: string } = {
  "genesis": "Genesis",
  "genesis_xl": "Genesis XL",
  "jr": "Jr",
};

export const modifyConfigsFromUrlParams = (config: Config) => {
  let newConfig: Config = { ...config };
  const urlParams = new URLSearchParams(window.location.search);
  const kit = urlParams.get("kit")?.toLowerCase();
  if (kit) {
    const sizePreset = KIT_LOOKUP[kit];
    if (sizePreset && sizePreset != config.sizePreset) {
      newConfig = modifyConfig(newConfig, { sizePreset });
    }
  }
  STRING_KEYS.map(key => {
    const value = urlParams.get(key);
    if (value) {
      newConfig = modifyConfig(newConfig, { [key]: value });
    }
  });
  NUMBER_KEYS.map(key => {
    const value = urlParams.get(key);
    if (value) {
      newConfig = modifyConfig(newConfig, { [key]: parseInt(value) });
    }
  });
  BOOLEAN_KEYS.map(key => {
    const value = urlParams.get(key);
    if (value) {
      newConfig = modifyConfig(newConfig, { [key]: value == "true" });
    }
  });
  return newConfig;
};

type SeasonProperties = {
  sunIntensity: number;
  sunColor: string;
  cloudOpacity: number;
};
const SEASON_PROPERTIES: Record<string, SeasonProperties> = {
  Winter: { sunIntensity: 4 / 4, sunColor: "#A0C4FF", cloudOpacity: 0.85 },
  Spring: { sunIntensity: 7 / 4, sunColor: "#BDE0FE", cloudOpacity: 0.2 },
  Summer: { sunIntensity: 9 / 4, sunColor: "#FFFFFF", cloudOpacity: 0 },
  Fall: { sunIntensity: 5.5 / 4, sunColor: "#FFD6BC", cloudOpacity: 0.3 },
};
export const getSeasonProperties = (
  config: Config,
  fallback: string,
): SeasonProperties => {
  const params = SEASON_PROPERTIES[config.plants] || SEASON_PROPERTIES[fallback];
  return {
    sunIntensity: params.sunIntensity,
    sunColor: params.sunColor,
    cloudOpacity: params.cloudOpacity,
  };
};

export const detailLevels = (config: Config) =>
  config.lowDetail ? [0, 0] : [0, 50000];
