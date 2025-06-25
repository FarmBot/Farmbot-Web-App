import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { Config, INITIAL } from "../three_d_garden/config";
import {
  BotSize, MapTransformProps, AxisNumberProperty, TaggedPlant,
} from "./map/interfaces";
import { clone } from "lodash";
import { BotPosition, SourceFbosConfig } from "../devices/interfaces";
import {
  ConfigurationName, TaggedCurve, TaggedGenericPointer, TaggedWeedPointer,
} from "farmbot";
import { DesignerState } from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { calcSunCoordinate, ThreeDGardenPlant } from "../three_d_garden/garden";
import { findIcon } from "../crops/find";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";
import { isPeripheralActiveFunc } from "./map/layers/farmbot/bot_peripherals";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { SCENES } from "../settings/three_d_settings";
import { get3DTime, latLng } from "../three_d_garden/time_travel";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  get3DConfigValue(key: string): number;
  sourceFbosConfig: SourceFbosConfig;
  negativeZ: boolean;
  designer: DesignerState;
  plants: TaggedPlant[];
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  botPosition: BotPosition;
  toolSlots?: SlotWithTool[];
  mountedToolName: string | undefined;
  peripheralValues: PeripheralValues;
  device: DeviceAccountSettings;
}

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  const config = clone(INITIAL);
  const { gridSize } = props.mapTransformProps;
  config.botSizeX = gridSize.x;
  config.botSizeY = gridSize.y;
  config.bedWidthOuter = gridSize.y + 160;
  config.bedLengthOuter = gridSize.x + 280;
  config.zoomBeacons = false;
  config.trail = !!props.getWebAppConfigValue(BooleanSetting.display_trail);
  config.animate = !props.getWebAppConfigValue(BooleanSetting.disable_animations);

  config.kitVersion =
    props.sourceFbosConfig("firmware_hardware").value == "farmduino_k18"
      ? "v1.8"
      : "v1.7";

  config.negativeZ = props.negativeZ;
  config.exaggeratedZ = props.designer.threeDExaggeratedZ;

  config.x = props.botPosition.x || 0;
  config.y = props.botPosition.y || 0;
  config.z = props.botPosition.z || 0;

  const { designer } = props;
  config.distanceIndicator = designer.distanceIndicator;

  const fbosConfig = (key: ConfigurationName) =>
    props.sourceFbosConfig(key).value as number;
  config.zGantryOffset = fbosConfig("gantry_height");
  config.soilHeight = Math.abs(fbosConfig("soil_height"));

  const getValue = props.get3DConfigValue;
  config.bedWallThickness = getValue("bedWallThickness");
  config.bedHeight = getValue("bedHeight");
  config.ccSupportSize = getValue("ccSupportSize");
  config.beamLength = getValue("beamLength");
  config.columnLength = getValue("columnLength");
  config.zAxisLength = getValue("zAxisLength");
  config.bedXOffset = getValue("bedXOffset");
  config.bedYOffset = getValue("bedYOffset");
  config.bedZOffset = getValue("bedZOffset");
  config.legSize = getValue("legSize");
  config.legsFlush = !!getValue("legsFlush");
  config.extraLegsX = getValue("extraLegsX");
  config.extraLegsY = getValue("extraLegsY");
  config.bedBrightness = getValue("bedBrightness");
  config.clouds = !!getValue("clouds");
  config.laser = !!getValue("laser");
  config.stats = !!getValue("stats");
  config.threeAxes = !!getValue("threeAxes");
  config.solar = !!getValue("solar");
  config.lowDetail = !!getValue("lowDetail");
  config.eventDebug = !!getValue("eventDebug");
  config.cableDebug = !!getValue("cableDebug");
  config.lightsDebug = !!getValue("lightsDebug");
  config.ambient = getValue("ambient");
  config.heading = getValue("heading");
  config.bounds = !!getValue("bounds");
  config.grid = !!getValue("grid");

  config.scene = SCENES[getValue("scene")];
  config.people = false;

  config.north = true;
  config.desk = false;

  const { latitude, longitude, valid } = latLng(props.device);
  if (valid) {
    const date = get3DTime(props.designer.threeDTime).toDate();
    const { azimuth, inclination } = calcSunCoordinate(
      date, config.heading, latitude, longitude);
    config.sunAzimuth = azimuth;
    config.sunInclination = inclination;
  } else {
    config.sunAzimuth = getValue("sunAzimuth");
    config.sunInclination = getValue("sunInclination");
  }

  const isPeripheralActive = isPeripheralActiveFunc(props.peripheralValues);

  config.waterFlow = isPeripheralActive("water");
  config.light = isPeripheralActive("light");
  config.vacuum = isPeripheralActive("vacuum");
  const rotarySpeed = () => {
    const fwd = isPeripheralActive("rotary", "reverse");
    const rev = isPeripheralActive("reverse");
    if (rev && !fwd) { return -1; }
    if (fwd && !rev) { return 1; }
    return 0;
  };
  config.rotary = rotarySpeed();

  config.zoom = true;
  config.pan = true;
  config.rotate = !props.designer.threeDTopDownView;
  config.perspective = !props.designer.threeDTopDownView;

  const threeDPlants = convertPlants(config, props.plants);

  return <ThreeDGarden
    config={config}
    threeDPlants={threeDPlants}
    mapPoints={props.mapPoints}
    weeds={props.weeds}
    toolSlots={props.toolSlots}
    mountedToolName={props.mountedToolName}
    addPlantProps={{
      gridSize: props.mapTransformProps.gridSize,
      dispatch: props.dispatch,
      getConfigValue: props.getWebAppConfigValue,
      curves: props.curves,
      designer: props.designer,
    }} />;
};

export const convertPlants =
  (config: Config, plants: TaggedPlant[]): ThreeDGardenPlant[] =>
    plants.map(plant => ({
      id: plant.body.id,
      label: plant.body.name,
      icon: findIcon(plant.body.openfarm_slug),
      size: plant.body.radius * 2,
      spread: 0,
      x: plant.body.x + config.bedXOffset,
      y: plant.body.y + config.bedYOffset,
      key: "",
      seed: 0,
    }));
