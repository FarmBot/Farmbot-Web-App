import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { INITIAL } from "../three_d_garden/config";
import { BotSize, MapTransformProps, AxisNumberProperty } from "./map/interfaces";
import { clone } from "lodash";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
}

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  const config = clone(INITIAL);
  const { gridSize } = props.mapTransformProps;
  config.botSizeX = gridSize.x;
  config.botSizeY = gridSize.y;
  config.bedWidthOuter = gridSize.y + 160;
  config.bedLengthOuter = gridSize.x + 160;
  config.zoomBeacons = false;

  return <ThreeDGarden config={config} />;
};
