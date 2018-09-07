import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui/fb_select";
import { selectAllPoints } from "../../../resources/selectors";
import { TaggedResource, TaggedPoint } from "farmbot";

const TOP_HALF = [
  {
    heading: true,
    headingId: "WRONG",
    label: "Device",
    value: "WRONG",
  },
  {
    headingId: "Device",
    label: "Tool Mount",
    value: "WRONG",
  },
  {
    heading: true,
    headingId: "WRONG",
    label: "Plants",
    value: "WRONG",
  }
];

const isSaved = (x: TaggedResource) => !!x.body.id;

const asDDI = (x: TaggedPoint): DropDownItem => {
  return { headingId: "Plant", label: x.body.name || "?", value: x.uuid };
};

export const resourceList = (r: ResourceIndex): DropDownItem[] => {
  return [...TOP_HALF, ...selectAllPoints(r).filter(isSaved).map(asDDI)];
};
