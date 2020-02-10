import * as React from "react";
import { store } from "../../redux/store";
import { MapTransformProps } from "../map/interfaces";
import { isUndefined } from "lodash";
import { sortGroupBy } from "./point_group_sort_selector";
import { Color } from "../../ui";
import { transformXY } from "../map/util";
import { nn } from "./paths";
import { TaggedPoint, TaggedPointGroup } from "farmbot";

export interface GroupOrderProps {
  group: TaggedPointGroup | undefined;
  groupPoints: TaggedPoint[];
  mapTransformProps: MapTransformProps;
}

const sortedPointCoordinates = (
  group: TaggedPointGroup | undefined, groupPoints: TaggedPoint[]
): { x: number, y: number }[] => {
  if (isUndefined(group)) { return []; }
  const { resources } = store.getState();
  const groupSortType = resources.consumers.farm_designer.tryGroupSortType
    || group.body.sort_type;
  const sorted = groupSortType == "nn"
    ? nn(groupPoints)
    : sortGroupBy(groupSortType, groupPoints);
  return sorted.map(p => ({ x: p.body.x, y: p.body.y }));
};

export interface PointsPathLineProps {
  orderedPoints: { x: number, y: number }[];
  mapTransformProps: MapTransformProps;
  color?: Color;
  dash?: number;
  strokeWidth?: number;
}

export const PointsPathLine = (props: PointsPathLineProps) =>
  <g id="group-order"
    stroke={props.color || Color.mediumGray}
    strokeWidth={props.strokeWidth || 3}
    strokeDasharray={props.dash || 12}>
    {props.orderedPoints.map((p, i) => {
      const prev = i > 0 ? props.orderedPoints[i - 1] : p;
      const one = transformXY(prev.x, prev.y, props.mapTransformProps);
      const two = transformXY(p.x, p.y, props.mapTransformProps);
      return <line key={i} x1={one.qx} y1={one.qy} x2={two.qx} y2={two.qy} />;
    })}
  </g>;

export const GroupOrder = (props: GroupOrderProps) =>
  <PointsPathLine
    orderedPoints={sortedPointCoordinates(props.group, props.groupPoints)}
    mapTransformProps={props.mapTransformProps} />;
