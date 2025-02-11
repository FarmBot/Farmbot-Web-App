import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { INITIAL } from "../three_d_garden/config";
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
}

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  const config = clone(INITIAL);
  const { gridSize } = props.mapTransformProps;
  config.botSizeX = gridSize.x;
  config.botSizeY = gridSize.y;
  config.bedWidthOuter = gridSize.y + 160;
  config.bedLengthOuter = gridSize.x + 160;
  config.zoomBeacons = false;
  config.trail = !!props.getWebAppConfigValue(BooleanSetting.display_trail);

  const zDir = props.negativeZ ? -1 : 1;

  config.x = props.botPosition.x || 0;
  config.y = props.botPosition.y || 0;
  config.z = zDir * (props.botPosition.z || 0);

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
  config.bounds = !!getValue("bounds");
  config.grid = !!getValue("grid");

  config.zoom = true;
  config.pan = true;

  return <ThreeDGarden
    config={config}
    mapPoints={props.mapPoints}
    weeds={props.weeds}
    addPlantProps={{
      gridSize: props.mapTransformProps.gridSize,
      dispatch: props.dispatch,
      getConfigValue: props.getWebAppConfigValue,
      plants: props.plants,
      curves: props.curves,
      designer: props.designer,
    }} />;
};
