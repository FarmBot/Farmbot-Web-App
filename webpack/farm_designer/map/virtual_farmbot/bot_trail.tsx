import * as React from "react";
import * as _ from "lodash";
import { MapTransformProps } from "../interfaces";
import { getXYFromQuadrant } from "../util";
import { BotPosition } from "../../../devices/interfaces";

type TrailRecord = Record<"x" | "y", number | undefined>;

function getNewTrailArray(update: TrailRecord): TrailRecord[] {
  const key = "virtualTrail"; // sessionStorage location
  const trailLength = _.get(sessionStorage, key + "Length", 100);
  const arr = JSON.parse(_.get(sessionStorage, key, "[]")); // get array
  if (arr.length > (trailLength - 1)) { arr.shift(); } // max length reached
  if (!_.isEqual(_.last(arr), update)) { arr.push(update); } // unique addition
  sessionStorage.setItem(key, JSON.stringify(arr)); // save array
  return _.takeRight(arr, trailLength);
}

export interface BotTrailProps {
  position: BotPosition;
  mapTransformProps: MapTransformProps;
}

export function BotTrail(props: BotTrailProps) {
  const { quadrant, gridSize } = props.mapTransformProps;
  const { x, y } = props.position;
  const array = getNewTrailArray({ x, y });
  return <g id="trail">
    {array.map((cur: TrailRecord, i: number) => {
      const prev = array[i - 1]; // previous trail coordinate
      const opacity = Math.round((i / (array.length - 1)) * 100) / 100;
      if (i > 0 && _.isNumber(prev.x) && _.isNumber(prev.y)
        && _.isNumber(cur.x) && _.isNumber(cur.y)) {
        const p1 = getXYFromQuadrant(cur.x, cur.y, quadrant, gridSize);
        const p2 = getXYFromQuadrant(prev.x, prev.y, quadrant, gridSize);
        return <line id={`trail-line-${i}`} key={i}
          stroke="red" strokeOpacity={opacity} strokeWidth={opacity * 2}
          x1={p1.qx} y1={p1.qy} x2={p2.qx} y2={p2.qy} />;
      }
    })}
  </g>;
}
