import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { INITIAL } from "../three_d_garden/config";
import {
  BotSize, MapTransformProps, AxisNumberProperty, TaggedPlant,
} from "./map/interfaces";
import { camelCase, clone } from "lodash";
import { SourceFbosConfig } from "../devices/interfaces";
import { ConfigurationName } from "farmbot";
import { DesignerState } from "./interfaces";
import { ASSETS } from "../three_d_garden/constants";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  get3DConfigValue(key: string): number;
  sourceFbosConfig: SourceFbosConfig;
  designer: DesignerState;
  plants: TaggedPlant[];
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

  const plants = props.plants.map(plant => {
    return {
      label: plant.body.name,
      icon: ASSETS.icons[camelCase(plant.body.openfarm_slug)]
        || ASSETS.icons.arugula,
      size: plant.body.radius * 2,
      spread: 0,
      x: plant.body.x + config.bedXOffset,
      y: plant.body.y + config.bedYOffset,
    };
  });

  config.zoom = true;
  config.pan = true;

  return <ThreeDGarden config={config} plants={plants} />;
};
