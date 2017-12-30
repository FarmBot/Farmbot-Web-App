import * as React from "react";
import { MapTransformProps } from "./interfaces";
import { getXYFromQuadrant, round } from "./util";
import { BotPosition } from "../../devices/interfaces";
import { isNumber } from "lodash";
import { Color } from "../../ui/colors";

export interface TargetCoordinateProps {
  chosenLocation: BotPosition;
  mapTransformProps: MapTransformProps;
}

export function TargetCoordinate(props: TargetCoordinateProps) {
  const { x, y } = props.chosenLocation;
  const { quadrant, gridSize } = props.mapTransformProps;
  if (isNumber(x) && isNumber(y)) {
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    return <g id="target-coordinate">
      <defs>
        <g id={"target-coordinate-crosshair-segment"}>
          <rect
            x={qx - 10}
            y={qy - 2}
            width={10}
            height={4}
            fill={Color.darkGray} />
        </g>
      </defs>
      {[45, 135, 225, 315].map(rotation => {
        return (
          <use key={rotation.toString()}
            xlinkHref={"#target-coordinate-crosshair-segment"}
            transform={`rotate(${rotation}, ${qx}, ${qy})`} />);
      })}
    </g>;
  } else {
    return <g id="target-coordinate" />;
  }
}
