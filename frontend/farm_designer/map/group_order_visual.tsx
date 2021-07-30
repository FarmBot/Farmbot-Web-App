import React from "react";
import { store } from "../../redux/store";
import { MapTransformProps } from "./interfaces";
import { isUndefined } from "lodash";
import { sortGroupBy } from "../../point_groups/point_group_sort";
import { Color } from "../../ui";
import { transformXY } from "./util";
import {
  nn, alternating, ExtendedPointGroupSortType, convertToXY,
} from "../../point_groups/paths";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import { zoomCompensation } from "./zoom";

export interface GroupOrderProps {
  group: TaggedPointGroup | undefined;
  groupPoints: TaggedPoint[];
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
}

export const sortGroup = (
  groupSortType: ExtendedPointGroupSortType,
  groupPoints: TaggedPoint[],
) => {
  switch (groupSortType) {
    case "xy_alternating": return alternating(groupPoints, "xy");
    case "yx_alternating": return alternating(groupPoints, "yx");
    case "nn": return nn(groupPoints);
    default: return sortGroupBy(groupSortType, groupPoints);
  }
};

const sortedPointCoordinates = (
  group: TaggedPointGroup | undefined, groupPoints: TaggedPoint[],
): { x: number, y: number }[] => {
  if (isUndefined(group)) { return []; }
  const { resources } = store.getState();
  const groupSortType = resources.consumers.farm_designer.tryGroupSortType
    || group.body.sort_type;
  return convertToXY(sortGroup(groupSortType, groupPoints));
};

export interface PointsPathLineProps {
  orderedPoints: { x: number, y: number }[];
  mapTransformProps: MapTransformProps;
  color?: Color;
  dash?: number;
  strokeWidth?: number;
  zoomLvl: number;
}

export const PointsPathLine = (props: PointsPathLineProps) =>
  <g id="group-order-line"
    stroke={props.color || Color.mediumGray}
    strokeWidth={props.strokeWidth || zoomCompensation(props.zoomLvl, 3)}
    strokeDasharray={props.dash || zoomCompensation(props.zoomLvl, 12)}>
    {props.orderedPoints.map((p, i) => {
      const prev = i > 0 ? props.orderedPoints[i - 1] : p;
      const one = transformXY(prev.x, prev.y, props.mapTransformProps);
      const two = transformXY(p.x, p.y, props.mapTransformProps);
      return <g id="group-order-element" key={i}>
        <line x1={one.qx} y1={one.qy} x2={two.qx} y2={two.qy} />
      </g>;
    })}
  </g>;

export interface PointsPathLabelsProps {
  orderedPoints: { x: number, y: number }[];
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
}

export const PointsPathLabels = (props: PointsPathLabelsProps) =>
  <g id="group-order-labels">
    {props.orderedPoints.map((p, i) => {
      const position = transformXY(p.x, p.y, props.mapTransformProps);
      const offset = 15;
      return <g id="group-order-label-element" key={i} stroke={"none"}>
        <circle cx={position.qx + offset} cy={position.qy - offset}
          r={zoomCompensation(props.zoomLvl, 9.5)}
          fill={Color.white} fillOpacity={0.65} />
        <text x={position.qx + offset} y={position.qy - offset}
          fontSize={zoomCompensation(props.zoomLvl, 1.45) + "rem"}
          fill={Color.darkGray} fillOpacity={0.75} fontWeight={"bold"}
          textAnchor={"middle"} alignmentBaseline={"middle"}>
          {i + 1}
        </text>
      </g>;
    })}
  </g>;

export const GroupOrder = (props: GroupOrderProps) =>
  <g id="group-order" style={{ pointerEvents: "none" }}>
    <PointsPathLine
      orderedPoints={sortedPointCoordinates(props.group, props.groupPoints)}
      zoomLvl={props.zoomLvl}
      mapTransformProps={props.mapTransformProps} />
    <PointsPathLabels
      orderedPoints={sortedPointCoordinates(props.group, props.groupPoints)}
      zoomLvl={props.zoomLvl}
      mapTransformProps={props.mapTransformProps} />
  </g>;

interface NNPathProps {
  pathPoints: TaggedPoint[];
  mapTransformProps: MapTransformProps;
}

export const NNPath = (props: NNPathProps) =>
  localStorage.getItem("try_it") == "ok"
    ? <PointsPathLine
      color={Color.blue}
      strokeWidth={2}
      dash={1}
      orderedPoints={convertToXY(nn(props.pathPoints))}
      zoomLvl={1}
      mapTransformProps={props.mapTransformProps} />
    : <g />;
