import React from "react";
import { t } from "../../../i18next_wrapper";
import {
  PlantPointer, ToolSlotPointer, WeedPointer, GenericPointer,
  DeviceAccountSettings, Point,
} from "farmbot/dist/resources/api_resources";
import { CustomFieldWarningProps, MaybeResourceArg } from "./interfaces";
import { isIdentifier } from "./field_selection";

export const CustomFieldWarning = (props: CustomFieldWarningProps) =>
  props.field && !validFields(props.resource).includes(props.field)
    && !props.field.includes("meta.")
    ? <div className="custom-field-warning">
      <i className="fa fa-exclamation-triangle" />
      <p>
        {t("Invalid property for resource.")}
      </p>
      {!(props.resource.kind == "resource" &&
        props.resource.args.resource_type == "Device") &&
        <p className={"did-you-mean"}
          onClick={() => props.update({
            field: "meta." + props.field,
            value: undefined
          })}>
          {t("Did you mean meta.{{field}}?", { field: props.field })}
        </p>}
    </div>
    : <div className="custom-field-warning" />;

const validFields = (resource: MaybeResourceArg): string[] => {
  if (isIdentifier(resource) || resource.kind == "nothing") {
    return POINT_FIELDS;
  }
  switch (resource.args.resource_type) {
    case "Device": return DEVICE_FIELDS;
    case "Weed": return WEED_FIELDS;
    case "GenericPointer": return GENERIC_POINTER_FIELDS;
    default: return PLANT_FIELDS;
  }
};

type BaseFields = (keyof Point)[];
type PlantFields = (keyof PlantPointer)[];
type ToolSlotFields = (keyof ToolSlotPointer)[];
type GenericPointerFields = (keyof GenericPointer)[];
type WeedFields = (keyof WeedPointer)[];
type PointFields = (
  keyof PlantPointer
  | keyof ToolSlotPointer
  | keyof GenericPointer
  | keyof WeedPointer
)[];

const BASE_FIELDS: BaseFields =
  ["name", "pointer_type", "x", "y", "z", "meta"];
const PLANT_FIELDS: PlantFields = (BASE_FIELDS as PlantFields)
  .concat(["openfarm_slug", "plant_stage", "planted_at", "radius"]);
const TOOL_SLOT_FIELDS: ToolSlotFields = (BASE_FIELDS as ToolSlotFields)
  .concat(["tool_id", "pullout_direction", "gantry_mounted"]);
const GENERIC_POINTER_FIELDS: GenericPointerFields =
  (BASE_FIELDS as GenericPointerFields).concat(["radius"]);
const WEED_FIELDS: WeedFields = (BASE_FIELDS as WeedFields)
  .concat(["plant_stage", "radius"]);
const POINT_FIELDS: PointFields = (BASE_FIELDS as PointFields)
  .concat(PLANT_FIELDS)
  .concat(TOOL_SLOT_FIELDS)
  .concat(GENERIC_POINTER_FIELDS)
  .concat(WEED_FIELDS);
const DEVICE_FIELDS: (keyof DeviceAccountSettings)[] =
  ["name", "mounted_tool_id", "ota_hour", "timezone"];
