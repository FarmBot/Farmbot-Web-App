import * as React from "react";
import { AxisNumberProperty, MapTransformProps } from "../interfaces";
import { getMapSize, getXYFromQuadrant } from "../util";
import { BotPosition } from "../../../devices/interfaces";
import { Color } from "../../../ui/index";

export interface BotFigureProps {
  name: string;
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
  eStopStatus?: boolean;
}

export function BotFigure(props: BotFigureProps) {
  const { name, position, plantAreaOffset, eStopStatus } = props;
  const { quadrant, gridSize } = props.mapTransformProps;
  const mapSize = getMapSize(gridSize, plantAreaOffset);
  const positionQ = getXYFromQuadrant(
    (position.x || 0), (position.y || 0), quadrant, gridSize);
  const color = eStopStatus ? Color.virtualRed : Color.darkGray;
  const opacity = name.includes("encoder") ? 0.25 : 0.75;
  return <g id={name}>
    <rect id="gantry"
      x={positionQ.qx - 10}
      y={-plantAreaOffset.y
      }
      width={20}
      height={mapSize.y}
      fillOpacity={opacity}
      fill={color} />
    <circle id="UTM"
      cx={positionQ.qx}
      cy={positionQ.qy}
      r={35}
      fillOpacity={opacity}
      fill={color} />
  </g>;
}
