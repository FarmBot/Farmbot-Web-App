import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { FBSelect } from "../../../ui";
import {
  resource_type as RESOURCE_TYPE, Identifier, Resource, Nothing,
} from "farmbot";
import { ResourceSelectionProps } from "./interfaces";
import { ResourceIndex, UUID } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui/fb_select";
import {
  selectAllPoints, maybeGetDevice, findPointerByTypeAndId,
} from "../../../resources/selectors";
import { formatPoint } from "../../locals_list/location_form_list";
import {
  maybeFindVariable, SequenceMeta,
} from "../../../resources/sequence_meta";

export const ResourceSelection = (props: ResourceSelectionProps) =>
  <div className={"update-resource-step-resource"}>
    <label>{t("Mark")}</label>
    <FBSelect
      list={resourceList(props.resources, props.sequenceUuid)}
      onChange={ddi => props.updateResource(prepareResource(ddi))}
      selectedItem={getSelectedResource(
        props.resource, props.resources, props.sequenceUuid)} />
  </div>;

const prepareResource = (ddi: DropDownItem): Resource | Identifier => {
  switch (ddi.headingId) {
    case "Identifier":
      return { kind: "identifier", args: { label: "" + ddi.value } };
    default:
      return {
        kind: "resource",
        args: {
          resource_type: ddi.headingId as RESOURCE_TYPE,
          resource_id: parseInt("" + ddi.value)
        }
      };
  }
};

const resourceList =
  (resources: ResourceIndex, sequenceUuid: UUID): DropDownItem[] => {
    const deviceId = maybeGetDevice(resources)?.body.id || 0;
    const points = selectAllPoints(resources).filter(p => !!p.body.id);
    const mapPoints = points.filter(p => p.body.pointer_type == "GenericPointer");
    const weeds = points.filter(p => p.body.pointer_type == "Weed");
    const plants = points.filter(p => p.body.pointer_type == "Plant");
    const headingCommon = { heading: true, value: 0 };
    const varLabel = resourceVariableLabel(maybeFindVariable(
      "parent", resources, sequenceUuid));
    return [
      { headingId: "Identifier", label: varLabel, value: "parent" },
      { headingId: "Device", label: t("Device"), ...headingCommon },
      { headingId: "Device", label: t("Tool Mount"), value: deviceId },
      { headingId: "Plant", label: t("Plants"), ...headingCommon },
      ...plants.map(formatPoint),
      { headingId: "GenericPointer", label: t("Points"), ...headingCommon },
      ...mapPoints.map(formatPoint),
      { headingId: "Weed", label: t("Weeds"), ...headingCommon },
      ...weeds.map(formatPoint),
    ];
  };

const getSelectedResource = (
  resource: Resource | Identifier | Nothing,
  resources: ResourceIndex,
  sequenceUuid: UUID,
): DropDownItem => {
  switch (resource.kind) {
    case "resource":
      const { resource_type, resource_id } = resource.args;
      if (resource_type == "Device") {
        return { label: t("Tool Mount"), value: resource_id };
      }
      return formatPoint(
        findPointerByTypeAndId(resources, resource_type, resource_id));
    case "identifier":
      const variable =
        maybeFindVariable(resource.args.label, resources, sequenceUuid);
      return {
        label: resourceVariableLabel(variable),
        value: resource.args.label,
      };
    case "nothing": return { label: t("Select one"), value: "" };
  }
};

const resourceVariableLabel = (variable: SequenceMeta | undefined) =>
  `${t("Variable")} - ${variable?.dropdown.label || t("Add new")}`;
