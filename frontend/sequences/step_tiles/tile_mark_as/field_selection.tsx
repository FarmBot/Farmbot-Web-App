import React from "react";
import { t } from "../../../i18next_wrapper";
import { FBSelect, DropDownItem, BlurableInput } from "../../../ui";
import { Identifier, Point } from "farmbot";
import { isUndefined } from "lodash";
import {
  FieldSelectionProps, CustomFieldSelectionProps, MaybeResourceArg, ResourceArg,
} from "./interfaces";

export const FieldSelection = (props: FieldSelectionProps) =>
  <div className={"row grid-2-col"}>
    <label>{t("property")}</label>
    {(isCustomMetaField(props.field) && !isUndefined(props.field))
      ? <CustomMetaField {...props} field={props.field} />
      : <KnownFieldSelection {...props} />}
  </div>;

const KnownFieldSelection = (props: FieldSelectionProps) =>
  <FBSelect
    extraClass={(props.resource.kind == "nothing" || props.disabled)
      ? "disabled"
      : ""}
    list={props.resource.kind == "nothing"
      ? []
      : fieldList(props.resource)
        .concat([UPDATE_RESOURCE_DDIS().CUSTOM_META_FIELD])}
    onChange={ddi => props.update({
      field: "" + ddi.value,
      value: undefined
    })}
    allowEmpty={false}
    selectedItem={getSelectedField(props.resource, knownField(props.field))} />;

const CustomMetaField = (props: CustomFieldSelectionProps) =>
  <div className="custom-meta-field">
    <BlurableInput type="text" name="field"
      onCommit={e => props.update({
        field: e.currentTarget.value,
        value: undefined
      })}
      allowEmpty={true}
      value={props.field} />
    <i className={"reset-custom-field fa fa-undo"}
      title={t("reset")}
      onClick={() => props.update({ field: undefined, value: undefined })} />
  </div>;

export enum KnownField {
  plant_stage = "plant_stage",
  mounted_tool_id = "mounted_tool_id",
  x = "x",
  y = "y",
  z = "z",
  radius = "radius",
  "meta.color" = "meta.color",
  planted_at = "planted_at",
}

const isKnownField = (x: string | undefined): x is KnownField =>
  !!(x && Object.keys(KnownField).includes(x));

const knownField =
  (field: string | undefined): KnownField | undefined =>
    isKnownField(field) ? field : undefined;

export const isCustomMetaField = (field: string | undefined): boolean =>
  !(isUndefined(field) || knownField(field));

export const isIdentifier =
  (resource: MaybeResourceArg): resource is Point | Identifier =>
    resource.kind == "identifier" || resource.kind == "point";

const fieldList = (resource: ResourceArg) => {
  const DDI = UPDATE_RESOURCE_DDIS();
  const POINT_DDIS = COMMON_POINT_DDIS();
  if (isIdentifier(resource)) {
    return [DDI.STATUS, DDI.COLOR].concat(POINT_DDIS);
  }
  switch (resource.args.resource_type) {
    case "Device": return [DDI.MOUNTED_TOOL];
    case "Weed": return [DDI.WEED_STATUS, DDI.COLOR].concat(POINT_DDIS);
    case "GenericPointer": return [DDI.COLOR].concat(POINT_DDIS);
    default: return [DDI.PLANT_STAGE].concat(POINT_DDIS);
  }
};

const COMMON_POINT_DDIS = () => {
  const DDI = UPDATE_RESOURCE_DDIS();
  return [
    DDI.X,
    DDI.Y,
    DDI.Z,
    DDI.RADIUS,
  ];
};

// eslint-disable-next-line complexity
const getSelectedField = (
  resource: MaybeResourceArg,
  field: KnownField | undefined,
): DropDownItem => {
  const DDI = UPDATE_RESOURCE_DDIS();
  if (isUndefined(field) || resource.kind == "nothing") { return DDI.SELECT_ONE; }
  const resourceType =
    isIdentifier(resource) ? "Point" : resource.args.resource_type;
  switch (field) {
    case KnownField.x: return DDI.X;
    case KnownField.y: return DDI.Y;
    case KnownField.z: return DDI.Z;
    case KnownField.radius: return DDI.RADIUS;
    case KnownField["meta.color"]: return DDI.COLOR;
    case KnownField.mounted_tool_id: return DDI.MOUNTED_TOOL;
    case KnownField.plant_stage:
      if (resourceType == "Weed") { return DDI.WEED_STATUS; }
      if (resourceType == "GenericPointer") { return DDI.POINT_STATUS; }
      if (resourceType == "Plant") { return DDI.PLANT_STAGE; }
      return DDI.STATUS;
    case KnownField.planted_at: return DDI.PLANTED_AT;
  }
};

export const UPDATE_RESOURCE_DDIS = (): Record<string, DropDownItem> => ({
  SELECT_ONE: { label: t("Select one"), value: "" },
  CUSTOM_META_FIELD: { label: t("Custom field"), value: "" },
  STATUS: { label: t("Status"), value: "plant_stage" },
  MOUNTED_TOOL: { label: t("Mounted Tool"), value: "mounted_tool_id" },
  WEED_STATUS: { label: t("Weed status"), value: "plant_stage" },
  POINT_STATUS: { label: t("Point status"), value: "plant_stage" },
  PLANT_STAGE: { label: t("Plant stage"), value: "plant_stage" },
  X: { label: t("X"), value: "x" },
  Y: { label: t("Y"), value: "y" },
  Z: { label: t("Z"), value: "z" },
  RADIUS: { label: t("Radius"), value: "radius" },
  COLOR: { label: t("Color"), value: "meta.color" },
  NONE: { label: t("None"), value: 0 },
  ACTIVE: { label: t("Active"), value: "active" },
  REMOVED: { label: t("Removed"), value: "removed" },
  PENDING: { label: t("Pending"), value: "pending" },
  PLANTED_AT: { label: t("Date Planted"), value: "planted_at" },
  NOW: { label: t("Now"), value: "{{ timeNow }}" },
});
