import React from "react";
import { t } from "../../../i18next_wrapper";
import { FBSelect, BlurableInput, DropDownItem } from "../../../ui";
import { isUndefined } from "lodash";
import {
  ValueSelectionProps, GetSelectedValueProps, KnownValueSelectionProps,
  ResourceArg,
} from "./interfaces";
import { ResourceIndex } from "../../../resources/interfaces";
import { selectAllTools, maybeFindToolById } from "../../../resources/selectors";
import {
  PLANT_STAGE_LIST, PLANT_STAGE_DDI_LOOKUP, WEED_STAGE_DDI_LOOKUP,
  ALL_STAGE_LIST, ALL_STAGE_DDI_LOOKUP,
} from "../../../plants/edit_plant_status";
import {
  isCustomMetaField, KnownField, UPDATE_RESOURCE_DDIS, isIdentifier,
} from "./field_selection";
import { DevSettings } from "../../../settings/dev/dev_support";

export const ValueSelection = (props: ValueSelectionProps) =>
  <div className={"row grid-2-col"}>
    <label onClick={() => DevSettings.futureFeaturesEnabled() && props.add({})}>
      {t("as")}
    </label>
    {isCustomMetaField(props.field) || (!isUndefined(props.field)
      && props.field !== KnownField.plant_stage
      && props.field !== KnownField.planted_at
      && props.field !== KnownField.mounted_tool_id)
      ? <CustomMetaValue {...props} />
      : <KnownValue {...props} field={props.field} />}
  </div>;

const KnownValue = (props: KnownValueSelectionProps) =>
  <FBSelect
    extraClass={(isUndefined(props.field) || props.disabled) ? "disabled" : ""}
    list={props.resource.kind == "nothing"
      ? []
      : valuesList(props.resource, props.resources, props.field)}
    onChange={ddi => {
      props.update({ value: ddi.value },
        props.commitSelection);
    }}
    selectedItem={getSelectedValue({
      resourceIndex: props.resources,
      resource: props.resource,
      field: props.field,
      value: props.value,
    })} />;

const CustomMetaValue = (props: ValueSelectionProps) =>
  <div className="custom-meta-field">
    <BlurableInput type="text" name="value"
      allowEmpty={true}
      value={isUndefined(props.value) ? "" : "" + props.value}
      onCommit={e => {
        props.update({ value: e.currentTarget.value },
          props.commitSelection);
      }} />
  </div>;

const valuesList = (
  resource: ResourceArg,
  resources: ResourceIndex,
  field: KnownField | undefined,
): DropDownItem[] => {
  const DDI = UPDATE_RESOURCE_DDIS();
  const stepResourceType =
    isIdentifier(resource) ? undefined : resource.args.resource_type;
  switch (stepResourceType) {
    case "Device": return [
      DDI.NONE,
      ...selectAllTools(resources).filter(x => !!x.body.id)
        .map(x => ({ toolName: x.body.name, toolId: x.body.id }))
        .map(({ toolName, toolId }:
          { toolName: string | undefined, toolId: number }) =>
          ({ label: toolName || t("Untitled tool"), value: toolId })),
    ];
    case "GenericPointer": return [DDI.PENDING, DDI.ACTIVE, DDI.REMOVED];
    case "Weed": return [DDI.PENDING, DDI.ACTIVE, DDI.REMOVED];
    case "Plant":
      return field == KnownField.planted_at ? [DDI.NOW] : PLANT_STAGE_LIST();
    default: return ALL_STAGE_LIST();
  }
};

const getSelectedValue = (props: GetSelectedValueProps): DropDownItem => {
  const DDI = UPDATE_RESOURCE_DDIS();
  if (isUndefined(props.field) || isUndefined(props.value)
    || props.resource.kind == "nothing") { return DDI.SELECT_ONE; }
  switch (props.field) {
    case KnownField.mounted_tool_id:
      const toolId = parseInt("" + props.value);
      if (toolId == 0) { return DDI.NONE; }
      const tool = maybeFindToolById(props.resourceIndex, toolId);
      if (!tool) { return { label: t("Unknown tool"), value: toolId }; }
      return {
        label: tool.body.name || t("Untitled tool"),
        value: toolId
      };
    case KnownField.plant_stage:
      const stepResourceType = isIdentifier(props.resource)
        ? undefined
        : props.resource.args.resource_type;
      return getStageLookup(stepResourceType)["" + props.value]
        || { label: "" + props.value, value: "" + props.value };
    case KnownField.planted_at: return DDI.NOW;
  }
};

const getStageLookup = (resourceType: string | undefined) => {
  switch (resourceType) {
    case "Plant": return PLANT_STAGE_DDI_LOOKUP();
    case "Weed": return WEED_STAGE_DDI_LOOKUP();
    default: return ALL_STAGE_DDI_LOOKUP();
  }
};
