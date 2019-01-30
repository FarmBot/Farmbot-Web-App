import { DropDownItem } from "../../../ui";
import { t } from "i18next";

export const MOUNTED_TO = t("Mounted to:");

export const DISMOUNT: DropDownItem = { label: t("Not Mounted"), value: 0 };

/** Legal "actions" for "Mark As.." block when marking Point resources */
export const POINT_OPTIONS: DropDownItem[] = [
  { label: t("Removed"), value: "removed" }
];

/** Legal "actions" in the "Mark As.." block when operating on
 * a Plant resource. */
export const PLANT_OPTIONS: DropDownItem[] = [
  { label: t("Planned"), value: "planned" },
  { label: t("Planted"), value: "planted" },
  { label: t("Harvested"), value: "harvested" },
];

const value = 0; // Not used in headings.

export const PLANT_HEADER: DropDownItem = {
  headingId: "Plant",
  label: t("Plants"),
  value,
  heading: true
};

export const POINT_HEADER: DropDownItem = {
  headingId: "GenericPointer",
  label: t("Points"),
  value,
  heading: true
};

export const TOP_HALF = [
  { headingId: "Device", label: t("Device"), value, heading: true, },
  { headingId: "Device", label: t("Tool Mount"), value }
];
