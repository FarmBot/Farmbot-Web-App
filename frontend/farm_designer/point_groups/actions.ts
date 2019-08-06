import { unpackUUID, betterCompact } from "../../util";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { initSave } from "../../api/crud";

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
    const all = points.map(x => unpackUUID(x).remoteId);
    const point_ids = betterCompact(all);
    const group: PointGroup =
      ({ name: name || UNTITLED, point_ids });
    return initSave("PointGroup", group)(dispatch);
  };
