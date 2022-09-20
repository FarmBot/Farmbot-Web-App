import React from "react";
import { sortGroupBy, sortOptionsTable } from "./point_group_sort";
import { isUndefined, sortBy, uniq } from "lodash";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { Actions } from "../constants";
import { edit, save } from "../api/crud";
import { TaggedPointGroup, TaggedPoint, TaggedSensorReading } from "farmbot";

export const convertToXY =
  (points: (TaggedPoint | TaggedSensorReading)[]): { x: number, y: number }[] =>
    points
      .map(p => ({ x: p.body.x, y: p.body.y }))
      .filter(p => !isUndefined(p.x) && !isUndefined(p.y))
      .map(p => p as { x: number, y: number });

export const distance = (
  p1: { x: number, y: number },
  p2: { x: number, y: number },
) =>
  Math.pow(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2), 0.5);

const pathDistance = (pathPoints: (TaggedPoint | TaggedSensorReading)[]) => {
  let total = 0;
  let prev: { x: number, y: number } | undefined = undefined;
  convertToXY(pathPoints)
    .map(p => {
      prev ? total += distance(p, prev) : 0;
      prev = p;
    });
  return Math.round(total);
};

export const findNearest = (
  from: { x: number, y: number },
  available: (TaggedPoint | TaggedSensorReading)[],
): TaggedPoint | TaggedSensorReading | undefined => {
  const distances = available
    .filter(p => !isUndefined(p.body.x) && !isUndefined(p.body.y))
    .map(p => ({
      point: p,
      distance: distance({ x: p.body.x as number, y: p.body.y as number }, from)
    }));
  return sortBy(distances, "distance")[0]?.point;
};

export const nn = (pathPoints: TaggedPoint[]) => {
  let available = pathPoints.slice(0);
  const ordered: (TaggedPoint | TaggedSensorReading)[] = [];
  let from = { x: 0, y: 0 };
  pathPoints.map(() => {
    const nearest = findNearest(from, available);
    if (!nearest || isUndefined(nearest.body.x) || isUndefined(nearest.body.y)) {
      return;
    }
    ordered.push(nearest);
    from = { x: nearest.body.x, y: nearest.body.y };
    available = available.filter(p => p.uuid !== nearest.uuid);
  });
  return ordered;
};

export const alternating = (pathPoints: TaggedPoint[], axis: "xy" | "yx") => {
  const axis0: "x" | "y" = axis[0] as "x" | "y";
  const axis1: "x" | "y" = axis[1] as "x" | "y";
  const ordered: TaggedPoint[] = [];
  const rowCoordinates = sortBy(uniq(pathPoints.map(p => p.body[axis0])));
  const rows = rowCoordinates.map((rowCoordinate, index) => {
    const row = sortBy(pathPoints.filter(p =>
      p.body[axis0] == rowCoordinate), "body." + axis1);
    return index % 2 == 0 ? row : row.reverse();
  });
  rows.map(row => row.map(p => ordered.push(p)));
  return ordered;
};

export type ExtendedPointGroupSortType = PointGroupSortType;

const SORT_TYPES: ExtendedPointGroupSortType[] = [
  "random", "yx_descending", "yx_ascending", "xy_descending", "xy_ascending"];

export interface PathInfoBarProps {
  sortTypeKey: ExtendedPointGroupSortType;
  dispatch: Function;
  group: TaggedPointGroup;
  pathData: { [key: string]: number };
}

export const PathInfoBar = (props: PathInfoBarProps) => {
  const { sortTypeKey, dispatch, group } = props;
  const pathLength = props.pathData[sortTypeKey];
  const maxLength = Math.max(...Object.values(props.pathData));
  const normalizedLength = pathLength / maxLength * 100;
  const sortLabel = () => {
    switch (sortTypeKey) {
      default: return sortOptionsTable()[sortTypeKey];
    }
  };
  const selected = group.body.sort_type == sortTypeKey;
  return <div className={`sort-option-bar ${selected ? "selected" : ""}`}
    onMouseEnter={() =>
      dispatch({ type: Actions.TRY_SORT_TYPE, payload: sortTypeKey })}
    onMouseLeave={() =>
      dispatch({ type: Actions.TRY_SORT_TYPE, payload: undefined })}
    onClick={() => {
      dispatch(edit(group, { sort_type: sortTypeKey }));
      dispatch(save(group.uuid));
    }}>
    <div className={"sort-path-info-bar"}
      style={{ width: `${normalizedLength}%` }}>
      {`${sortLabel()}: ${Math.round(pathLength / 10) / 100}m`}
    </div>
  </div>;
};

export interface PathsProps {
  pathPoints: TaggedPoint[];
  dispatch: Function;
  group: TaggedPointGroup;
}

interface PathsState {
  pathData: Record<string, number>;
}

export class Paths extends React.Component<PathsProps, PathsState> {
  state: PathsState = { pathData: {} };

  generatePathData = (pathPoints: TaggedPoint[]) => {
    const newPathData: Record<string, number> = {};
    SORT_TYPES.map((sortType: PointGroupSortType) =>
      newPathData[sortType] = pathDistance(sortGroupBy(sortType, pathPoints)));
    newPathData.xy_alternating = pathDistance(alternating(pathPoints, "xy"));
    newPathData.yx_alternating = pathDistance(alternating(pathPoints, "yx"));
    newPathData.nn = pathDistance(nn(pathPoints));
    this.setState({ pathData: newPathData });
  };

  componentDidMount = () => this.generatePathData(this.props.pathPoints);

  render() {
    return <div className={"group-sort-types"}>
      {SORT_TYPES.concat(["yx_alternating", "xy_alternating", "nn"])
        .reverse()
        .map(sortType =>
          <PathInfoBar key={sortType}
            sortTypeKey={sortType}
            dispatch={this.props.dispatch}
            group={this.props.group}
            pathData={this.state.pathData} />)}
    </div>;
  }
}
