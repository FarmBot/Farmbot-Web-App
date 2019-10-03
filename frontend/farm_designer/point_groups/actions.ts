import { betterCompact } from "../../util";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { init, save } from "../../api/crud";
import { history } from "../../history";
import { GetState } from "../../redux/interfaces";
import { findPointGroup } from "../../resources/selectors";

const UNTITLED = "Untitled Group";

interface CreateGroupProps {
  /** TaggedPoint UUIDs */
  points: string[];
  name?: string;
}

/** This probably won't work as a long term
 * solution because it won't add points created
 * during the current user session (localId of 0)
 */
export const createGroup = ({ points, name }: CreateGroupProps) => {
  return function (dispatch: Function, getState: GetState) {
    const { references } = getState().resources.index;
    const possiblyNil = points
      .map(x => references[x])
      .map(x => x ? x.body.id : undefined);
    const point_ids = betterCompact(possiblyNil);
    const group: PointGroup = ({
      name: name || UNTITLED, point_ids,
      sort_type: "xy_ascending"
    });
    const action = init("PointGroup", group);
    dispatch(action);
    return dispatch(save(action.payload.uuid)).then(() => {
      const pg = findPointGroup(getState().resources.index, action.payload.uuid);
      const { id } = pg.body;
      history.push("/app/designer/groups/" + (id ? id : ""));
    });
  };
};
