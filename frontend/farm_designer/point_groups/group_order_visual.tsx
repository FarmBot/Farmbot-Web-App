import * as React from "react";
import { store } from "../../redux/store";
import { MapTransformProps, TaggedPlant } from "../map/interfaces";
import { fetchGroupFromUrl } from "./group_detail";
import { isUndefined } from "lodash";
import { sortGroupBy } from "./point_group_sort_selector";
import { Color } from "../../ui";
import { transformXY } from "../map/util";

export interface GroupOrderProps {
  plants: TaggedPlant[];
  mapTransformProps: MapTransformProps;
}

const sortedPointCoordinates =
  (plants: TaggedPlant[]): { x: number, y: number }[] => {
    const group = fetchGroupFromUrl(store.getState().resources.index);
    if (isUndefined(group)) { return []; }
    const groupPlants = plants
      .filter(p => group.body.point_ids.includes(p.body.id || 0));
    return sortGroupBy(group.body.sort_type, groupPlants)
      .map(p => ({ x: p.body.x, y: p.body.y }));
  };

export const GroupOrder = (props: GroupOrderProps) => {
  const points = sortedPointCoordinates(props.plants);
  return <g id="group-order"
    stroke={Color.mediumGray} strokeWidth={3} strokeDasharray={12}>
    {points.map((p, i) => {
      const prev = i > 0 ? points[i - 1] : p;
      const one = transformXY(prev.x, prev.y, props.mapTransformProps);
      const two = transformXY(p.x, p.y, props.mapTransformProps);
      return <line key={i} x1={one.qx} y1={one.qy} x2={two.qx} y2={two.qy} />;
    })}
  </g>;
};
