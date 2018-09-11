import { DropDownItem } from "../../../ui";
import { Dictionary } from "farmbot";
import { ResourceUpdate } from "../../../../latest_corpus";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllTools } from "../../../resources/selectors";

const DEFAULT = "Default";
const DISMOUNT = { label: "Not Mounted", value: 0 };
export const MOUNTED_TO = "Mounted to:";
export const PLANT_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "Planted", value: "planted" },
  { label: "Harvested", value: "harvested" },
];
const POINT_OPTIONS = [
  { label: "Removed", value: "removed" }
];

const allToolsAsDDI = (i: ResourceIndex) => {
  return selectAllTools(i)
    .filter(x => !!x.body.id)
    .map(x => {
      return {
        label: `${MOUNTED_TO} ${x.body.name}`,
        value: x.body.id || 0
      };
    });
};

type ListBuilder = (i: ResourceIndex) => DropDownItem[];

const ACTION_LIST: Dictionary<ListBuilder> = {
  "Device": (i) => [DISMOUNT, ...allToolsAsDDI(i)],
  "Plant": () => PLANT_OPTIONS,
  "GenericPointer": () => POINT_OPTIONS,
  [DEFAULT]: () => []
};

const getList =
  (t = DEFAULT): ListBuilder => (ACTION_LIST[t] || ACTION_LIST[DEFAULT]);

export const actionList = (d: DropDownItem | undefined,
  r: ResourceUpdate,
  i: ResourceIndex): DropDownItem[] => {
  return getList(d ? d.headingId : r.args.resource_type)(i);
};
