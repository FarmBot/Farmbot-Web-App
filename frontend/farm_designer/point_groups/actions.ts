import { unpackUUID, betterCompact } from "../../util";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { initSave } from "../../api/crud";
import { history } from "../../history";

const UNTITLED = "Untitled Group";

interface CreateGroupProps {
  /** TaggedPoint UUIDs */
  points: string[];
  name?: string;
  dispatch: Function;
}

/** This probably won't work as a long term
 * solution because it won't add points created
 * during the current user session (localId of 0)
 */
export const createGroup =
  ({ points, name, dispatch }: CreateGroupProps) => {
    console.warn("TODO: Handle points with a localID of 0");
    const all = points.map(x => unpackUUID(x).remoteId);
    const point_ids = betterCompact(all);
    const group: PointGroup = ({ name: name || UNTITLED, point_ids });
    const thunk = initSave("PointGroup", group);
    const p: Promise<{}> = thunk(dispatch);

    return p.then(() => history.push("/app/designer/groups"));
  };
