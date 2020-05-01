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
        .concat([{ label: t("Custom Meta Field"), value: "" }])}
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
  if (resource.kind == "identifier") {
    return [{ label: t("Status"), value: "plant_stage" }];
  }
  switch (resource.args.resource_type) {
    case "Device":
      return [{ label: t("Mounted Tool"), value: "mounted_tool_id" }];
    case "Weed":
      return [{ label: t("Weed status"), value: "plant_stage" }];
    case "GenericPointer":
      return [{ label: t("Status"), value: "plant_stage" }];
    default:
      return [{ label: t("Plant stage"), value: "plant_stage" }];
  }
};

const getSelectedField = (
  resource: Resource | Identifier | Nothing,
  field: KnownField | undefined,
): DropDownItem => {
  if (isUndefined(field) || resource.kind == "nothing") {
    return { label: t("Select one"), value: "" };
  }
  if (resource.kind == "identifier") {
    return { label: t("Status"), value: "plant_stage" };
  }
  const resourceType = resource.args.resource_type;
  switch (field) {
    case KnownField.mounted_tool_id:
      return { label: t("Mounted Tool"), value: "tool" };
    case KnownField.plant_stage:
      if (resourceType == "Weed") {
        return { label: t("Weed status"), value: "plant_stage" };
      }
      if (resourceType == "GenericPointer") {
        return { label: t("Status"), value: "plant_stage" };
      }
      return { label: t("Plant stage"), value: "plant_stage" };
  }
};
