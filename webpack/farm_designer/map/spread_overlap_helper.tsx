import * as React from "react";
import { SpreadOverlapHelperProps } from "./interfaces";
import { round, getXYFromQuadrant } from "./util";
import { isUndefined } from "util";
import { BotPosition } from "../../devices/interfaces";

enum Overlap {
  NONE = "none",
  SMALL = "yellow",
  MEDIUM = "orange",
  LARGE = "red",
}

export function SpreadOverlapHelper(props: SpreadOverlapHelperProps) {

  function getOverlap
    (activeXYZ: BotPosition | undefined, plantXYZ: BotPosition): Overlap {
    if (activeXYZ && !isUndefined(activeXYZ.x) && !isUndefined(activeXYZ.y)) {
      // Plant editing (dragging) is occuring
      const activeXY = { x: round(activeXYZ.x), y: round(activeXYZ.y) };
      const distance = Math.sqrt(Math.pow((activeXY.x - plantXYZ.x), 2) +
        Math.pow((activeXY.y - plantXYZ.y), 2));
      // Change "radius * 3|6|9" to "(spread1 + spread2) * 0.3|0.6|0.9"
      if (distance < radius * 3) {
        return Overlap.LARGE;
      }
      if (distance < radius * 6) {
        return Overlap.MEDIUM;
      }
      if (distance < radius * 9) {
        return Overlap.SMALL;
      }
    }
    return Overlap.NONE;
  }

  const { dragging, plant, quadrant, activeDragXY } = props;
  const { radius, x, y } = plant.body;

  const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);
  const gardenCoord: BotPosition = { x: round(x), y: round(y), z: 0 };

  return <g id="overlap-circle">
    {!dragging && // Non-active plants
      <circle
        className="overlap-circle"
        cx={qx}
        cy={qy}
        r={radius * 5}
        fill={getOverlap(activeDragXY, gardenCoord)}
        stroke={getOverlap(activeDragXY, gardenCoord)}
        fillOpacity="0.3" />}
  </g>;
}
