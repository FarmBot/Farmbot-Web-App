import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { INITIAL } from "../three_d_garden/config";
import {
  BotSize, MapTransformProps, AxisNumberProperty, TaggedPlant,
} from "./map/interfaces";
import { clone } from "lodash";
import { SourceFbosConfig } from "../devices/interfaces";
import { ConfigurationName, TaggedCurve } from "farmbot";
import { DesignerState } from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  get3DConfigValue(key: string): number;
  sourceFbosConfig: SourceFbosConfig;
  designer: DesignerState;
  plants: TaggedPlant[];
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
}

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  const config = clone(INITIAL);
  const { gridSize } = props.mapTransformProps;
  config.botSizeX = gridSize.x;
  config.botSizeY = gridSize.y;
  config.bedWidthOuter = gridSize.y + 160;
  config.bedLengthOuter = gridSize.x + 160;
  config.zoomBeacons = false;

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
    addPlantProps={{
      gridSize: props.mapTransformProps.gridSize,
      dispatch: props.dispatch,
      getConfigValue: props.getWebAppConfigValue,
      plants: props.plants,
      curves: props.curves,
      designer: props.designer,
    }} />;
};
