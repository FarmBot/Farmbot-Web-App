import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { FBSelect, DropDownItem, BlurableInput } from "../../../ui";
import { Resource, Identifier, Nothing } from "farmbot";
import { isUndefined } from "lodash";
import { FieldSelectionProps, CustomFieldSelectionProps } from "./interfaces";

export const FieldSelection = (props: FieldSelectionProps) =>
  <div className={"update-resource-step-field"}>
    <label>{t("field")}</label>
    {(isCustomMetaField(props.field) && !isUndefined(props.field))
      ? <CustomMetaField {...props} field={props.field} />
      : <KnownFieldSelection {...props} />}
  </div>;

const KnownFieldSelection = (props: FieldSelectionProps) =>
  <FBSelect
    extraClass={props.resource.kind == "nothing" ? "disabled" : ""}
    list={props.resource.kind == "nothing"
      ? []
      : fieldList(props.resource)
        .concat([UPDATE_RESOURCE_DDIS().CUSTOM_META_FIELD])}
    onChange={ddi => props.update({
      field: "" + ddi.value,
      value: undefined
    })}
    allowEmpty={false}
    selectedItem={getSelectedField(
      props.resource, knownField(props.field))} />;

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
}

const isKnownField = (x: string | undefined): x is KnownField =>
  !!(x && Object.keys(KnownField).includes(x));

export const knownField =
  (field: string | undefined): KnownField | undefined =>
    isKnownField(field) ? field : undefined;

export const isCustomMetaField = (field: string | undefined): boolean =>
  !(isUndefined(field) || knownField(field));

const fieldList = (resource: Resource | Identifier) => {
  const DDI = UPDATE_RESOURCE_DDIS();
  if (resource.kind == "identifier") { return [DDI.STATUS]; }
  switch (resource.args.resource_type) {
    case "Device": return [DDI.MOUNTED_TOOL];
    case "Weed": return [DDI.WEED_STATUS];
    case "GenericPointer": return [];
    default: return [DDI.PLANT_STAGE];
  }
};

const getSelectedField = (
  resource: Resource | Identifier | Nothing,
  field: KnownField | undefined,
): DropDownItem => {
  const DDI = UPDATE_RESOURCE_DDIS();
  if (isUndefined(field) || resource.kind == "nothing") { return DDI.SELECT_ONE; }
  if (resource.kind == "identifier") { return DDI.STATUS; }
  const resourceType = resource.args.resource_type;
  switch (field) {
    case KnownField.mounted_tool_id: return DDI.MOUNTED_TOOL;
    case KnownField.plant_stage:
      if (resourceType == "Weed") { return DDI.WEED_STATUS; }
      if (resourceType == "GenericPointer") { return DDI.POINT_STATUS; }
      return DDI.PLANT_STAGE;
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
  NONE: { label: t("None"), value: 0 },
  REMOVED: { label: t("Removed"), value: "removed" },
});
