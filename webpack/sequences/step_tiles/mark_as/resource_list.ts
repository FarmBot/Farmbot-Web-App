import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui/fb_select";
import { selectAllPoints } from "../../../resources/selectors";
import { TaggedResource, TaggedPoint } from "farmbot";

const value = 0; // Not used in headings.

export const TOP_HALF = [
  { headingId: "Device", label: "Device", value, heading: true, },
  { headingId: "Device", label: "Tool Mount", value },
  { headingId: "Plant", label: "Plants", value, heading: true, }
];

const isSaved = (x: TaggedResource) => !!x.body.id;

const asDDI = (x: TaggedPoint): DropDownItem => {
  const id = x.body.id || 0;
  return { headingId: "Plant", label: x.body.name || `Plant ${id}`, value: id };
};

export const resourceList = (r: ResourceIndex): DropDownItem[] => {
  return [...TOP_HALF, ...selectAllPoints(r).filter(isSaved).map(asDDI)];
};
