import * as React from "react";
import { getXYFromQuadrant, getMapSize } from "./util";
import { VirtualFarmBotProps } from "./interfaces";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";
import * as _ from "lodash";

type TrailRecord = Record<"x" | "y", number | undefined>;

function getNewTrailArray(update: TrailRecord) {
  const key = "virtualTrail"; // sessionStorage location
  const trailLength = 100;
  const arr = JSON.parse(_.get(sessionStorage, key, "[]")); // get array
  if (arr.length > (trailLength - 1)) { arr.shift(); } // max length reached
  if (!_.isEqual(_.last(arr), update)) { arr.push(update); } // unique addition
  sessionStorage.setItem(key, JSON.stringify(arr)); // save array
  return arr;
}

export function VirtualFarmBot(props: VirtualFarmBotProps) {
  const { x, y } = props.botPosition;
  const { mapTransformProps, plantAreaOffset } = props;
  const { quadrant, gridSize } = mapTransformProps;
  const mapSize = getMapSize(gridSize, plantAreaOffset);
  const { qx, qy } = getXYFromQuadrant((x || 0), (y || 0), quadrant, gridSize);

  const displayTrail = Session.getBool(BooleanSetting.displayTrail);
  const update = { x, y };
  const array = displayTrail ? getNewTrailArray(update) : [];

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
    {displayTrail &&
      <g id="trail">
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
      </g>}
  </g>;
}
