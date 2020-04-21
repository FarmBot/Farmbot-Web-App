import { Dictionary } from "farmbot";
import { DropDownItem } from "../../../ui";
import { ListBuilder } from "./interfaces";
import { ResourceIndex } from "../../../resources/interfaces";
import { UpdateResource } from "farmbot";
import { selectAllTools } from "../../../resources/selectors";
import {
  MOUNTED_TO,
  DISMOUNT,
  PLANT_OPTIONS,
  POINT_OPTIONS,
} from "./constants";

const allToolsAsDDI = (i: ResourceIndex) => {
  return selectAllTools(i)
    .filter(x => !!x.body.id)
    .map(x => {
      return {
        label: `${MOUNTED_TO()} ${x.body.name}`,
        value: x.body.id || 0
      };
    });
};

const DEFAULT = "Default";

const ACTION_LIST: Dictionary<ListBuilder> = {
  "Device": (i) => [DISMOUNT(), ...allToolsAsDDI(i)],
  "Plant": () => PLANT_OPTIONS(),
  "GenericPointer": () => POINT_OPTIONS(),
  "Weed": () => POINT_OPTIONS(),
  [DEFAULT]: () => []
};

const getList = (t: string): ListBuilder =>
  (ACTION_LIST[t] || ACTION_LIST[DEFAULT]);

export const actionList = (d: string | undefined,
  r: UpdateResource,
  i: ResourceIndex): DropDownItem[] => {
  const resourceType = r.args.resource.kind == "identifier"
    ? DEFAULT
    : r.args.resource.args.resource_type;
  return getList(d || resourceType)(i);
};
