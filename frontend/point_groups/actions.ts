import { betterCompact } from "../util";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { init, save, overwrite } from "../api/crud";
import { NavigateFunction } from "react-router";
import { GetState } from "../redux/interfaces";
import { findPointGroup } from "../resources/selectors";
import { t } from "../i18next_wrapper";
import { UUID } from "../resources/interfaces";
import { DEFAULT_CRITERIA, PointGroupCriteria } from "./criteria/interfaces";
import { TaggedPointGroup } from "farmbot";
import { Path } from "../internal_urls";

export interface CreateGroupProps {
  pointUuids?: UUID[];
  groupName?: string;
  criteria?: PointGroupCriteria;
  navigate: NavigateFunction;
}

export const createGroup = (props: CreateGroupProps) =>
  (dispatch: Function, getState: GetState) => {
    const { pointUuids, groupName, criteria } = props;
    const { references } = getState().resources.index;
    const possiblyNil = (pointUuids || [])
      .map(x => references[x])
      .map(x => x ? x.body.id : undefined);
    const point_ids = betterCompact(possiblyNil);
    const group: PointGroup = {
      name: groupName || t("Untitled Group"),
      point_ids,
      sort_type: "nn",
      criteria: criteria || DEFAULT_CRITERIA,
    };
    const action = init("PointGroup", group);
    dispatch(action);
    dispatch(save(action.payload.uuid))
      .then(() => {
        const pg = findPointGroup(getState().resources.index, action.payload.uuid);
        const { id } = pg.body;
        props.navigate(Path.groups(id));
      });
  };

export const overwriteGroup =
  (group: TaggedPointGroup, newGroupBody: PointGroup) =>
    (dispatch: Function) => {
      dispatch(overwrite(group, newGroupBody));
      dispatch(save(group.uuid));
    };
