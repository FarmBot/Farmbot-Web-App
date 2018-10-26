import * as React from "react";
import * as _ from "lodash";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui";

type TrailRecord = {
  coord: Record<"x" | "y", number | undefined>,
  water: number | undefined
} | undefined;

export enum VirtualTrail {
  records = "virtualTrailRecords",
  length = "virtualTrailLength"
}

function getNewTrailArray(update: TrailRecord, watering: boolean): TrailRecord[] {
  const key = VirtualTrail.records; // sessionStorage location
  const trailLength = _.get(sessionStorage, VirtualTrail.length, 100);
  const arr: TrailRecord[] = JSON.parse(_.get(sessionStorage, key, "[]"));
  if (arr.length > (trailLength - 1)) { arr.shift(); } // max length reached
  const last = arr[arr.length - 1]; // most recent item in array
  if (update && update.coord &&
    (!last || !_.isEqual(last.coord, update.coord))) { // coordinate comparison
    arr.push(update);  // unique addition
  } else { // nothing new to add, increase water circle size if watering
    if (watering && last && _.isNumber(last.water)) { last.water += 1; }
  }
  sessionStorage.setItem(key, JSON.stringify(arr)); // save array
  return _.takeRight(arr, trailLength);
}

export interface BotTrailProps {
  position: BotPosition;
  mapTransformProps: MapTransformProps;
  peripherals: { label: string, value: boolean }[];
}

export function BotTrail(props: BotTrailProps) {
  const toQ = (ox: number, oy: number) =>
    transformXY(ox, oy, props.mapTransformProps);

  const { x, y } = props.position;
  const watering = !!_.first(props.peripherals
    .filter(p => p.label.toLowerCase().includes("water"))
    .map(p => p.value));

  const array = getNewTrailArray({ coord: { x, y }, water: 0 }, watering);

  return <g className="virtual-bot-trail">
    {array.map((cur: TrailRecord, i: number) => {
      const prev = (array[i - 1] || { coord: undefined }).coord; // prev coord
      const opacity = _.round(Math.max(0.25, i / (array.length - 1)), 2);
      if (i > 0 && cur && prev && _.isNumber(prev.x) && _.isNumber(prev.y)
        && _.isNumber(cur.coord.x) && _.isNumber(cur.coord.y)
        && _.isNumber(cur.water)) {
        const p1 = toQ(cur.coord.x, cur.coord.y);
        const p2 = toQ(prev.x, prev.y);
        return <g key={i}>
          <line id={`trail-line-${i}`}
            stroke="red" strokeOpacity={opacity} strokeWidth={1 + opacity * 2}
            x1={p1.qx} y1={p1.qy} x2={p2.qx} y2={p2.qy} />
          {cur.water &&
            <circle id={`trail-water-${i}`}
              fill={Color.blue} opacity={opacity / 2}
              cx={p1.qx} cy={p1.qy} r={cur.water} />}
        </g>;
      }
    })}
  </g>;
}
