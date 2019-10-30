import * as React from "react";
import { store } from "../../redux/store";
import { MapTransformProps, TaggedPlant } from "../map/interfaces";
import { fetchGroupFromUrl } from "./group_detail";
import { isUndefined } from "lodash";
import { sortGroupBy } from "./point_group_sort_selector";
import { Color } from "../../ui";
import { transformXY } from "../map/util";
import { nn } from "./paths";

export interface GroupOrderProps {
  plants: TaggedPlant[];
  mapTransformProps: MapTransformProps;
}

const sortedPointCoordinates =
  (plants: TaggedPlant[]): { x: number, y: number }[] => {
    const { resources } = store.getState();
    const group = fetchGroupFromUrl(resources.index);
    if (isUndefined(group)) { return []; }
    const groupPlants = plants
      .filter(p => group.body.point_ids.includes(p.body.id || 0));
    const groupSortType = resources.consumers.farm_designer.tryGroupSortType
      || group.body.sort_type;
    const sorted = groupSortType == "nn"
      ? nn(groupPlants)
      : sortGroupBy(groupSortType, groupPlants);
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
    orderedPoints={sortedPointCoordinates(props.plants)}
    mapTransformProps={props.mapTransformProps} />;
