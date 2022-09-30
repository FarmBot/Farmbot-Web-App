import React from "react";
import { MapTransformProps } from "./interfaces";
import { isUndefined } from "lodash";
import { sortGroupBy } from "../../point_groups/point_group_sort";
import { Color } from "../../ui";
import { transformXY } from "./util";
import {
  ExtendedPointGroupSortType, convertToXY,
} from "../../point_groups/paths";
import { TaggedPoint, TaggedPointGroup } from "farmbot";
import { zoomCompensation } from "./zoom";
import { equals } from "../../util";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

export interface GroupOrderProps {
  group: TaggedPointGroup | undefined;
  groupPoints: TaggedPoint[];
  zoomLvl: number;
  mapTransformProps: MapTransformProps;
  tryGroupSortType: PointGroupSortType | undefined;
}

export const sortGroup = (
  groupSortType: ExtendedPointGroupSortType,
  groupPoints: TaggedPoint[],
) => {
  switch (groupSortType) {
    default: return sortGroupBy(groupSortType, groupPoints);
  }
};

const sortedPointCoordinates = (
  group: TaggedPointGroup | undefined,
  groupPoints: TaggedPoint[],
  tryGroupSortType: PointGroupSortType | undefined,
): { x: number, y: number }[] => {
  if (isUndefined(group)) { return []; }
  const groupSortType = tryGroupSortType || group.body.sort_type;
  return convertToXY(sortGroup(groupSortType, groupPoints));
};

interface PointsPathLineProps {
  orderedPoints: { x: number, y: number }[];
  mapTransformProps: MapTransformProps;
  color?: Color;
  dash?: number;
  strokeWidth?: number;
  zoomLvl: number;
}

const PointsPathLine = (props: PointsPathLineProps) =>
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

interface PointsPathLabelsProps {
  orderedPoints: { x: number, y: number }[];
  mapTransformProps: MapTransformProps;
  zoomLvl: number;
}

const PointsPathLabels = (props: PointsPathLabelsProps) =>
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

export class GroupOrder extends React.Component<GroupOrderProps> {

  get sorted() {
    return sortedPointCoordinates(this.props.group,
      this.props.groupPoints, this.props.tryGroupSortType);
  }

  shouldComponentUpdate = (nextProps: GroupOrderProps) => {
    if (this.props.groupPoints.length < 50) { return true; }
    const shouldUpdate = !equals(this.props, nextProps);
    return shouldUpdate;
  };

  render() {
    const { zoomLvl, mapTransformProps } = this.props;
    const orderedPoints = this.sorted;
    return <g id="group-order" style={{ pointerEvents: "none" }}>
      <PointsPathLine
        orderedPoints={orderedPoints}
        zoomLvl={zoomLvl}
        mapTransformProps={mapTransformProps} />
      <PointsPathLabels
        orderedPoints={orderedPoints}
        zoomLvl={zoomLvl}
        mapTransformProps={mapTransformProps} />
    </g>;
  }
}
