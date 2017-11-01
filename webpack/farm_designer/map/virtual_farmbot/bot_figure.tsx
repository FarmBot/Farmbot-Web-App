import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../interfaces";
import { getMapSize, getXYFromQuadrant } from "../util";
import { BotPosition } from "../../../devices/interfaces";

export interface BotFigureProps {
  name: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
}

export function BotFigure(props: BotFigureProps) {
  const { name, position, plantAreaOffset } = props;
  const { quadrant, gridSize } = props.mapTransformProps;
  const mapSize = getMapSize(gridSize, plantAreaOffset);
  const positionQ = getXYFromQuadrant(
    (position.x || 0), (position.y || 0), quadrant, gridSize);
  const opacity = name.includes("encoder") ? 0.25 : 0.75;
  return <g id={name}>
    <rect id="gantry"
      x={positionQ.qx - 10}
      y={-plantAreaOffset.y
      }
      width={20}
      height={mapSize.y}
      fillOpacity={opacity}
      fill={"#434343"} />
    <circle id="UTM"
      cx={positionQ.qx}
      cy={positionQ.qy}
      r={35}
      fillOpacity={opacity}
      fill={"#434343"} />
  </g>;
}
