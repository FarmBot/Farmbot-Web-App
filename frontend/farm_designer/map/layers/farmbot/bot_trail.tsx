import React from "react";
import { AxisNumberProperty, MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui";
import { get, isNumber, takeRight, isEqual, round } from "lodash";
import { Xyz } from "farmbot";
import { indicatorColor } from "../../../../controls/move/missed_step_indicator";
import { GetProfileX } from "../../profile/interfaces";
import { definedPosition } from "../../../../tools/tool_slot_edit_components";
import { withinProfileRange } from "../../profile/content";
import { isPeripheralActiveFunc } from "./bot_peripherals";

type MissedSteps = Record<Xyz, number | undefined>;

type TrailRecord = {
  coord: BotPosition,
  miss: MissedSteps | undefined,
  water: number | undefined
};

export enum VirtualTrail {
  records = "virtualTrailRecords",
  length = "virtualTrailLength"
}

function getNewTrailArray(
  update: TrailRecord, watering: boolean, readOnly: boolean,
): TrailRecord[] {
  const key = VirtualTrail.records; // sessionStorage location
  const trailLength: number = get(sessionStorage, VirtualTrail.length, 100);
  const arr: TrailRecord[] = JSON.parse(get(sessionStorage, key, "[]") as string);
  if (readOnly) { return takeRight(arr, trailLength); }
  if (arr.length > (trailLength - 1)) { arr.shift(); } // max length reached
  const last = arr[arr.length - 1]; // most recent item in array
  if (definedPosition(update.coord) &&
    (!last || !isEqual(last.coord, update.coord))) { // coordinate comparison
    arr.push(update); // unique addition
  } else { // nothing new to add, increase water circle size if watering
    if (watering && last && isNumber(last.water)) { last.water += 1; }
  }
  sessionStorage.setItem(key, JSON.stringify(arr)); // save array
  return takeRight(arr, trailLength);
}

export type PeripheralValues = { label: string, value: boolean }[];

export interface BotTrailProps {
  position: BotPosition;
  missedSteps: BotPosition | undefined;
  displayMissedSteps: boolean;
  mapTransformProps: MapTransformProps;
  peripheralValues: PeripheralValues;
  getX?: GetProfileX;
  profileAxis?: "x" | "y";
  selectionWidth?: number;
  profilePosition?: AxisNumberProperty;
}

export function BotTrail(props: BotTrailProps) {
  const toQ = (original: Record<Xyz, number>) =>
    props.getX
      ? { qx: props.getX(original), qy: Math.abs(original.z) }
      : transformXY(original.x, original.y, props.mapTransformProps);

  const { x, y, z } = props.position;
  const watering = isPeripheralActiveFunc(props.peripheralValues)("water");

  const array = getNewTrailArray({
    coord: { x, y, z },
    miss: props.missedSteps,
    water: 0,
  }, watering, !!props.getX)
    .filter(p =>
      !(props.profileAxis && props.selectionWidth && props.profilePosition
        && isNumber(p.coord.x) && isNumber(p.coord.y)) ||
      withinProfileRange({
        axis: props.profileAxis,
        selectionWidth: props.selectionWidth,
        profilePosition: props.profilePosition,
        location: { x: p.coord.x, y: p.coord.y },
      }));

  const missedStepIcons = (
    position: { qx: number, qy: number },
    missed: MissedSteps | undefined,
    opacity: number,
  ) =>
    <g id={"missed-steps"}>
      {missed?.x && missed.x > 50 &&
        <text x={position.qx - 5} y={position.qy} textAnchor={"end"}
          fill={indicatorColor(missed.x)} fillOpacity={opacity}>X</text>}
      {missed?.y && missed.y > 50 &&
        <text x={position.qx} y={position.qy} textAnchor={"middle"}
          fill={indicatorColor(missed.y)} fillOpacity={opacity}>Y</text>}
      {missed?.z && missed.z > 50 &&
        <text x={position.qx + 5} y={position.qy} textAnchor={"start"}
          fill={indicatorColor(missed.z)} fillOpacity={opacity}>Z</text>}
    </g>;
  return <g className="virtual-bot-trail">
    {array.map((cur: TrailRecord, i: number) => {
      const prev = (array[i - 1] || { coord: undefined }).coord; // prev coord
      const opacity = round(Math.max(0.25, i / (array.length - 1)), 2);
      const previousCoordinate = prev && definedPosition(prev);
      const currentCoordinate = cur && definedPosition(cur.coord);
      if (i > 0 && previousCoordinate && currentCoordinate && isNumber(cur.water)) {
        const p1 = toQ(currentCoordinate);
        const p2 = toQ(previousCoordinate);
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
