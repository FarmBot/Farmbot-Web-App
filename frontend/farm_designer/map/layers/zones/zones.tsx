import * as React from "react";
import { TaggedPointGroup } from "farmbot";
import { MapTransformProps, BotSize } from "../../interfaces";
import { transformXY } from "../../util";
import { isUndefined } from "lodash";
import { UUID } from "../../../../resources/interfaces";
import { history } from "../../../../history";

export interface ZonesProps {
  currentGroup: UUID | undefined;
  group: TaggedPointGroup;
  mapTransformProps: MapTransformProps;
  botSize: BotSize;
}

interface GetBoundaryProps {
  group: TaggedPointGroup;
  botSize: BotSize;
}

type Boundary = {
  x1: number, y1: number, x2: number, y2: number,
  selectsAll: boolean
};
type Line = { x?: number, y?: number };
type Point = { x: number, y: number };
export enum ZoneType { points, lines, area, none }

export const getZoneType = (group: TaggedPointGroup): ZoneType => {
  const numEq = group.body.criteria.number_eq;
  const numGt = group.body.criteria.number_gt;
  const numLt = group.body.criteria.number_lt;
  const hasXEq = !!numEq.x?.length;
  const hasYEq = !!numEq.y?.length;
  if (hasXEq && hasYEq) {
    return ZoneType.points;
  }
  if ((hasXEq && !hasYEq) || (!hasXEq && hasYEq)) {
    return ZoneType.lines;
  }
  if (numGt.x || numGt.y || numLt.x || numLt.y) {
    return ZoneType.area;
  }
  return ZoneType.none;
};

const openGroup = (id: number | undefined) =>
  () => history.push(`/app/designer/groups/${id}`);

/** Bounds for area selected by criteria or bot extents. */
const getBoundary = (props: GetBoundaryProps): Boundary => {
  const { criteria } = props.group.body;
  const gt = criteria.number_gt;
  const lt = criteria.number_lt;
  const x1 = gt.x || 0;
  const x2 = lt.x || props.botSize.x.value;
  const y1 = gt.y || 0;
  const y2 = lt.y || props.botSize.y.value;
  const selectsAll = !(gt.x || lt.x || gt.y || lt.y);
  return { x1, x2, y1, y2, selectsAll };
};

/** Apply bounds to zone data. */
const filter: <T extends Point | Line>(
  boundary: Boundary, data: T[] | undefined) => T[] =
  (boundary, data) =>
    data?.filter(({ x, y }) =>
      (isUndefined(x) || (x > boundary.x1 && x < boundary.x2)) &&
      (isUndefined(y) || (y > boundary.y1 && y < boundary.y2))) || [];

/** Coordinates selected by both x and y number equal values. */
const getPoints =
  (boundary: Boundary, group: TaggedPointGroup): Point[] => {
    const xs = group.body.criteria.number_eq.x;
    const ys = group.body.criteria.number_eq.y;
    const points: Point[] = [];
    xs?.map(x => ys?.map(y => points.push({ x, y })));
    return filter<Point>(boundary, points);
  };

/** Coordinates selected by both x and y number equal values. */
const zone0D = (props: ZonesProps) =>
  getPoints(getBoundary(props), props.group)
    .map(point => {
      const { qx, qy } = transformXY(point.x, point.y, props.mapTransformProps);
      return { x: qx, y: qy };
    });

/** Coordinates selected by both x and y number equal values. */
export const Zones0D = (props: ZonesProps) => {
  const current = props.group.uuid == props.currentGroup;
  const { id } = props.group.body;
  return <g id={`zones-0D-${id}`} onClick={openGroup(id)}
    className={current ? "current" : ""}>
    {zone0D(props).map((point, i) =>
      <circle key={i} cx={point.x} cy={point.y} r={5} />)}
  </g>;
};

/** Lines selected by an x or y number equal value. */
const getLines =
  (boundary: Boundary, group: TaggedPointGroup): Line[] => {
    const xs = group.body.criteria.number_eq.x;
    const ys = group.body.criteria.number_eq.y;
    const onlyXs = !!xs?.length && !ys?.length;
    const onlyYs = !!ys?.length && !xs?.length;
    const xLineData = (onlyXs && xs) ? xs.map(x => ({ x })) : undefined;
    const yLineData = (onlyYs && ys) ? ys.map(y => ({ y })) : undefined;
    return filter<Line>(boundary, xLineData || yLineData);
  };

/** Lines selected by an x or y number equal value. */
const zone1D = (props: ZonesProps) => {
  const boundary = getBoundary(props);
  return getLines(boundary, props.group).map(line => {
    const min = transformXY(
      line.x || boundary.x1,
      line.y || boundary.y1, props.mapTransformProps);
    const max = transformXY(
      line.x || boundary.x2,
      line.y || boundary.y2, props.mapTransformProps);
    return {
      x1: min.qx,
      y1: min.qy,
      x2: max.qx,
      y2: max.qy,
    };
  });
};

/** Lines selected by an x or y number equal value. */
export const Zones1D = (props: ZonesProps) => {
  const current = props.group.uuid == props.currentGroup;
  const { id } = props.group.body;
  return <g id={`zones-1D-${id}`} onClick={openGroup(id)}
    className={current ? "current" : ""}>
    {zone1D(props).map((line, i) =>
      <line key={i} x1={line.x1} y1={line.y1}
        x2={line.x2} y2={line.y2} />)}
  </g>;
};

/** Area selected by x and y number gt/lt values. */
const zone2D = (boundary: Boundary, mapTransformProps: MapTransformProps) => {
  const position = transformXY(boundary.x1, boundary.y1, mapTransformProps);
  const { xySwap, quadrant } = mapTransformProps;
  const xLength = boundary.x2 - boundary.x1;
  const yLength = boundary.y2 - boundary.y1;
  return {
    x: [1, 4].includes(quadrant) ? position.qx - xLength : position.qx,
    y: [3, 4].includes(quadrant) ? position.qy - yLength : position.qy,
    width: xySwap ? yLength : xLength,
    height: xySwap ? xLength : yLength,
    selectsAll: boundary.selectsAll,
  };
};

/** Area selected by x and y number gt/lt values. */
export const Zones2D = (props: ZonesProps) => {
  const zone = zone2D(getBoundary(props), props.mapTransformProps);
  const current = props.group.uuid == props.currentGroup;
  const { id } = props.group.body;
  return <g id={`zones-2D-${id}`} onClick={openGroup(id)}
    className={current ? "current" : ""}>
    {!zone.selectsAll &&
      <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} />}
  </g>;
};
