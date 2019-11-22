import * as React from "react";
import { TaggedPlant, MapTransformProps } from "../map/interfaces";
import { sortGroupBy, sortOptionsTable } from "./point_group_sort_selector";
import { sortBy } from "lodash";
import { PointsPathLine } from "./group_order_visual";
import { Color } from "../../ui";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { Actions } from "../../constants";
import { edit } from "../../api/crud";
import { TaggedPointGroup } from "farmbot";
import { error } from "../../toast/toast";

const xy = (point: TaggedPlant) => ({ x: point.body.x, y: point.body.y });

const distance = (p1: { x: number, y: number }, p2: { x: number, y: number }) =>
  Math.pow(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2), 0.5);

const pathDistance = (points: TaggedPlant[]) => {
  let total = 0;
  let prev: { x: number, y: number } | undefined = undefined;
  points.map(xy)
    .map(p => {
      prev ? total += distance(p, prev) : 0;
      prev = p;
    });
  return Math.round(total);
};

const findNearest =
  (from: { x: number, y: number }, available: TaggedPlant[]) => {
    const distances = available.map(p => ({
      point: p, distance: distance(xy(p), from)
    }));
    return sortBy(distances, "distance")[0].point;
  };

export const nn = (points: TaggedPlant[]) => {
  let available = points.slice(0);
  const ordered: TaggedPlant[] = [];
  let from = { x: 0, y: 0 };
  points.map(() => {
    if (available.length < 1) { return; }
    const nearest = findNearest(from, available);
    ordered.push(nearest);
    from = { x: nearest.body.x, y: nearest.body.y };
    available = available.filter(p => p.uuid !== nearest.uuid);
  });
  return ordered;
};

const SORT_TYPES: (PointGroupSortType | "nn")[] = [
  "random", "xy_ascending", "xy_descending", "yx_ascending", "yx_descending"];

export interface PathInfoBarProps {
  sortTypeKey: PointGroupSortType | "nn";
  dispatch: Function;
  group: TaggedPointGroup;
  pathData: { [key: string]: number };
}

export const PathInfoBar = (props: PathInfoBarProps) => {
  const { sortTypeKey, dispatch, group } = props;
  const pathLength = props.pathData[sortTypeKey];
  const maxLength = Math.max(...Object.values(props.pathData));
  const normalizedLength = pathLength / maxLength * 100;
  const sortLabel =
    sortTypeKey == "nn" ? "Optimized" : sortOptionsTable()[sortTypeKey];
  return <div className={"sort-path-info-bar"}
    onMouseEnter={() =>
      dispatch({ type: Actions.TRY_SORT_TYPE, payload: sortTypeKey })}
    onMouseLeave={() =>
      dispatch({ type: Actions.TRY_SORT_TYPE, payload: undefined })}
    onClick={() =>
      sortTypeKey == "nn"
        ? error(t("Not supported yet."))
        : dispatch(edit(group, { sort_type: sortTypeKey }))}
    style={{ width: `${normalizedLength}%` }}>
    {`${sortLabel}: ${Math.round(pathLength / 10) / 100}m`}
  </div>;
};

interface PathsProps {
  points: TaggedPlant[];
  dispatch: Function;
  group: TaggedPointGroup;
}

interface PathsState {
  pathData: { [key: string]: number };
}

export class Paths extends React.Component<PathsProps, PathsState> {
  state: PathsState = { pathData: {} };

  generatePathData = (points: TaggedPlant[]) => {
    SORT_TYPES.map((sortType: PointGroupSortType) =>
      this.state.pathData[sortType] =
      pathDistance(sortGroupBy(sortType, points)));
    this.state.pathData.nn = pathDistance(nn(points));
  };

  render() {
    if (!this.state.pathData.nn) { this.generatePathData(this.props.points); }
    return <div>
      <label>{t("Path lengths by sort type")}</label>
      {SORT_TYPES.concat("nn").map(st =>
        <PathInfoBar key={st}
          sortTypeKey={st}
          dispatch={this.props.dispatch}
          group={this.props.group}
          pathData={this.state.pathData} />)}
    </div>;
  }
}

interface NNPathProps {
  plants: TaggedPlant[];
  mapTransformProps: MapTransformProps;
}

export const NNPath = (props: NNPathProps) =>
  localStorage.getItem("try_it") == "ok"
    ? <PointsPathLine
      color={Color.blue}
      strokeWidth={2}
      dash={1}
      orderedPoints={nn(props.plants).map(xy)}
      mapTransformProps={props.mapTransformProps} />
    : <g />;
