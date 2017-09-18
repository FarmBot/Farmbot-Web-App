import * as React from "react";
import { getXYFromQuadrant, getMapSize } from "./util";
import { VirtualFarmBotProps } from "./interfaces";

export function VirtualFarmBot(props: VirtualFarmBotProps) {
  const { x, y } = props.botPosition;
  const { mapTransformProps, plantAreaOffset } = props;
  const { quadrant, gridSize } = mapTransformProps;
  const mapSize = getMapSize(gridSize, plantAreaOffset);
  const { qx, qy } = getXYFromQuadrant((x || 0), (y || 0), quadrant, gridSize);
  return <g id="virtual-farmbot">
    <rect id="gantry"
      x={qx - 10}
      y={-plantAreaOffset.y}
      width={20}
      height={mapSize.y}
      fillOpacity={0.75}
      fill={"#434343"} />
    <circle id="UTM"
      cx={qx}
      cy={qy}
      r={35}
      fillOpacity={0.75}
      fill={"#434343"} />
  </g>;
}
