import * as React from "react";
import { BotPosition } from "../../../../devices/interfaces";
import { MapTransformProps, AxisNumberProperty } from "../../interfaces";
import { transformXY } from "../../util";
import { Color } from "../../../../ui";
import { botPositionLabel } from "./bot_position_label";

export interface NegativePositionLabelProps {
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  plantAreaOffset: AxisNumberProperty;
}

export function NegativePositionLabel(props: NegativePositionLabelProps) {
  const { position, mapTransformProps, plantAreaOffset } = props;
  const xIsNegative = position.x && position.x < 0;
  const yIsNegative = position.y && position.y < 0;
  const origin = transformXY(
    -plantAreaOffset.x + 40,
    -plantAreaOffset.y - 10,
    mapTransformProps);

  return <g id={"negative-position-label"}
    fontFamily="Arial" textAnchor="middle" dominantBaseline="central"
    fill={Color.darkGray} fontSize={10}>
    <text
      visibility={(xIsNegative || yIsNegative) ? "visible" : "hidden"}
      x={origin.qx}
      y={origin.qy}>
      {botPositionLabel(position)}
    </text>
  </g>;
}
