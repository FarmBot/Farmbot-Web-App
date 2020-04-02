import { DropDownItem } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { PLANT_STAGE_LIST } from "../../../farm_designer/plants/edit_plant_status";

export const MOUNTED_TO = () => t("Mounted to:");

export const DISMOUNT = (): DropDownItem =>
  ({ label: t("Not Mounted"), value: 0 });

/** Legal "actions" for "Mark As.." block when marking Point resources */
export const POINT_OPTIONS: DropDownItem[] = [
  { label: t("Removed"), value: "removed" },
];

/** Legal "actions" in the "Mark As.." block when operating on
 * a Plant resource. */
export const PLANT_OPTIONS = PLANT_STAGE_LIST;

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

export const WEED_HEADER: DropDownItem = {
  headingId: "Weed",
  label: t("Weeds"),
  value,
  heading: true
};

export const TOP_HALF = [
  { headingId: "Device", label: t("Device"), value, heading: true },
  { headingId: "Device", label: t("Tool Mount"), value },
];
