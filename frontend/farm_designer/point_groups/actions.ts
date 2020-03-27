import { betterCompact } from "../../util";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { init, save } from "../../api/crud";
import { history } from "../../history";
import { GetState } from "../../redux/interfaces";
import { findPointGroup } from "../../resources/selectors";
import { t } from "../../i18next_wrapper";
import { UUID } from "../../resources/interfaces";
import { DEFAULT_CRITERIA } from "./criteria/interfaces";

interface CreateGroupProps {
  pointUuids: UUID[];
  groupName?: string;
}

export const createGroup = ({ pointUuids, groupName }: CreateGroupProps) =>
  (dispatch: Function, getState: GetState) => {
    const { references } = getState().resources.index;
    const possiblyNil = pointUuids
      .map(x => references[x])
      .map(x => x ? x.body.id : undefined);
    const point_ids = betterCompact(possiblyNil);
    const group: PointGroup = {
      name: groupName || t("Untitled Group"),
      point_ids,
      sort_type: "xy_ascending",
      group_type: ["Plant"],
      criteria: DEFAULT_CRITERIA
    };
    const action = init("PointGroup", group);
    dispatch(action);
    dispatch(save(action.payload.uuid))
      .then(() => {
        const pg = findPointGroup(getState().resources.index, action.payload.uuid);
        const { id } = pg.body;
        history.push("/app/designer/groups/" + (id ? id : ""));
      });
  };
