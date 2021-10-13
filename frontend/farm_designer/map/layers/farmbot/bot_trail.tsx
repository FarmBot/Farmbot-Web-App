import React from "react";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui";
import { get, isNumber, takeRight, isEqual, round, first } from "lodash";
import { Xyz } from "farmbot";
import { indicatorColor } from "../../../../controls/move/missed_step_indicator";

type TrailRecord = {
  coord: Record<"x" | "y", number | undefined>,
  miss: Record<Xyz, number | undefined> | undefined,
  water: number | undefined
} | undefined;

export enum VirtualTrail {
  records = "virtualTrailRecords",
  length = "virtualTrailLength"
}

function getNewTrailArray(update: TrailRecord, watering: boolean): TrailRecord[] {
  const key = VirtualTrail.records; // sessionStorage location
  const trailLength: number = get(sessionStorage, VirtualTrail.length, 100);
  const arr: TrailRecord[] = JSON.parse(get(sessionStorage, key, "[]") as string);
  if (arr.length > (trailLength - 1)) { arr.shift(); } // max length reached
  const last = arr[arr.length - 1]; // most recent item in array
  if (update?.coord &&
    (!last || !isEqual(last.coord, update.coord))) { // coordinate comparison
    arr.push(update); // unique addition
  } else { // nothing new to add, increase water circle size if watering
    if (watering && last && isNumber(last.water)) { last.water += 1; }
  }
  sessionStorage.setItem(key, JSON.stringify(arr)); // save array
  return takeRight(arr, trailLength);
}

export interface BotTrailProps {
  position: BotPosition;
  missedSteps: BotPosition | undefined;
  displayMissedSteps: boolean;
  mapTransformProps: MapTransformProps;
  peripherals: { label: string, value: boolean }[];
}

export function BotTrail(props: BotTrailProps) {
  const toQ = (ox: number, oy: number) =>
    transformXY(ox, oy, props.mapTransformProps);

  const { x, y } = props.position;
  const watering = !!first(props.peripherals
    .filter(p => p.label.toLowerCase().includes("water"))
    .map(p => p.value));

  const array = getNewTrailArray({
    coord: { x, y },
    miss: props.missedSteps,
    water: 0,
  }, watering);

  const missedStepIcons = (
    position: { qx: number, qy: number },
    missed: Record<Xyz, number | undefined> | undefined,
    opacity: number,
  ) =>
    <g id={"missed-steps"}>
      {missed?.x && missed?.x > 50 &&
        <text x={position.qx - 5} y={position.qy} textAnchor={"end"}
          fill={indicatorColor(missed.x)} fillOpacity={opacity}>X</text>}
      {missed?.y && missed?.y > 50 &&
        <text x={position.qx} y={position.qy} textAnchor={"middle"}
          fill={indicatorColor(missed.y)} fillOpacity={opacity}>Y</text>}
      {missed?.z && missed?.z > 50 &&
        <text x={position.qx + 5} y={position.qy} textAnchor={"start"}
          fill={indicatorColor(missed.z)} fillOpacity={opacity}>Z</text>}
    </g>;
  return <g className="virtual-bot-trail">
    {array.map((cur: TrailRecord, i: number) => {
      const prev = (array[i - 1] || { coord: undefined }).coord; // prev coord
      const opacity = round(Math.max(0.25, i / (array.length - 1)), 2);
      if (i > 0 && cur && prev && isNumber(prev.x) && isNumber(prev.y)
        && isNumber(cur.coord.x) && isNumber(cur.coord.y)
        && isNumber(cur.water)) {
        const p1 = toQ(cur.coord.x, cur.coord.y);
        const p2 = toQ(prev.x, prev.y);
        return <g id={"trail-record"} key={i}>
          <line id={`trail-line-${i}`}
            stroke="red" strokeOpacity={opacity} strokeWidth={1 + opacity * 2}
            x1={p1.qx} y1={p1.qy} x2={p2.qx} y2={p2.qy} />
          {cur.water &&
            <circle id={`trail-water-${i}`}
              fill={Color.blue} opacity={opacity / 2}
              cx={p1.qx} cy={p1.qy} r={cur.water} />}
          {props.displayMissedSteps && missedStepIcons(p1, cur.miss, opacity)}
        </g>;
      }
    })}
  </g>;
}

export const resetVirtualTrail = () =>
  sessionStorage.setItem(VirtualTrail.records, "[]");
