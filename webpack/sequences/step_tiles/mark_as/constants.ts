import { DropDownItem } from "../../../ui";

export const MOUNTED_TO = "Mounted to:";

export const DISMOUNT: DropDownItem = { label: "Not Mounted", value: 0 };

/** Legal "actions" for "Mark As.." block when marking Point resources */
export const POINT_OPTIONS: DropDownItem[] = [
  { label: "Removed", value: "removed" }
];

/** Legal "actions" in the "Mark As.." block when operating on
 * a Plant resource. */
export const PLANT_OPTIONS: DropDownItem[] = [
  { label: "Planned", value: "planned" },
  { label: "Planted", value: "planted" },
  { label: "Harvested", value: "harvested" },
];

const value = 0; // Not used in headings.

export const PLANT_HEADER: DropDownItem = {
  headingId: "Plant",
  label: "Plants",
  value,
  heading: true
};

export const POINT_HEADER: DropDownItem = {
  headingId: "GenericPointer",
  label: "Points",
  value,
  heading: true
};

export const TOP_HALF = [
  { headingId: "Device", label: "Device", value, heading: true, },
  { headingId: "Device", label: "Tool Mount", value }
];
