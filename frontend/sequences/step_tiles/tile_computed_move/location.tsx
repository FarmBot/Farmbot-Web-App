import React from "react";
import { FBSelect, DropDownItem } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import {
  LocationNode, LocSelection, LocationSelectionProps, AxisSelection,
} from "./interfaces";
import { ResourceIndex, UUID } from "../../../resources/interfaces";
import {
  selectAllPoints, findPointerByTypeAndId,
} from "../../../resources/selectors";
import {
  maybeFindVariable, SequenceMeta,
} from "../../../resources/sequence_meta";
import { formatPoint } from "../../locals_list/location_form_list";
import { Move, Xyz } from "farmbot";

export const LocationSelection = (props: LocationSelectionProps) =>
  <FBSelect
    key={JSON.stringify(props.sequence)}
    list={locationList(props.resources, props.sequenceUuid)}
    customNullLabel={t("Choose location")}
    onChange={ddi => props.onChange(prepareLocation(ddi))}
    selectedItem={getSelectedLocation(
      props.locationNode,
      props.locationSelection,
      props.resources,
      props.sequenceUuid,
    )} />;

const prepareLocation = (ddi: DropDownItem): {
  locationNode: LocationNode | undefined,
  locationSelection: LocSelection | undefined,
} => {
  switch (ddi.headingId) {
    case "Custom":
      return {
        locationNode: undefined,
        locationSelection: LocSelection.custom,
      };
    case "Offset":
      return {
        locationNode: undefined,
        locationSelection: LocSelection.offset,
      };
    case "Identifier":
      return {
        locationNode: { kind: "identifier", args: { label: "" + ddi.value } },
        locationSelection: LocSelection.identifier,
      };
    case "Plant":
    case "GenericPointer":
    case "Weed":
    case "ToolSlot":
      return {
        locationNode: {
          kind: "point",
          args: {
            pointer_id: parseInt("" + ddi.value),
            pointer_type: ddi.headingId,
          }
        },
        locationSelection: LocSelection.point,
      };
  }
  return {
    locationNode: undefined,
    locationSelection: undefined,
  };
};

const locationList =
  (resources: ResourceIndex, sequenceUuid: UUID): DropDownItem[] => {
    const points = selectAllPoints(resources).filter(p => !!p.body.id);
    const mapPoints = points.filter(p => p.body.pointer_type == "GenericPointer");
    const weeds = points.filter(p => p.body.pointer_type == "Weed");
    const plants = points.filter(p => p.body.pointer_type == "Plant");
    const slots = points.filter(p => p.body.pointer_type == "ToolSlot");
    const headingCommon = { heading: true, value: 0 };
    const varLabel = resourceVariableLabel(maybeFindVariable(
      "parent", resources, sequenceUuid));
    return [
      { headingId: "Custom", label: t("Custom coordinates"), value: "" },
      { headingId: "Offset", label: t("Offset from current location"), value: "" },
      { headingId: "Identifier", label: varLabel, value: "parent" },
      { headingId: "Plant", label: t("Plants"), ...headingCommon },
      ...plants.map(formatPoint),
      { headingId: "ToolSlot", label: t("Slots"), ...headingCommon },
      ...slots.map(formatPoint),
      { headingId: "GenericPointer", label: t("Points"), ...headingCommon },
      ...mapPoints.map(formatPoint),
      { headingId: "Weed", label: t("Weeds"), ...headingCommon },
      ...weeds.map(formatPoint),
    ];
  };

const getSelectedLocation = (
  locationNode: LocationNode | undefined,
  locationSelection: LocSelection | undefined,
  resources: ResourceIndex,
  sequenceUuid: UUID,
): DropDownItem | undefined => {
  switch (locationSelection) {
    case LocSelection.custom:
      return { label: t("Custom coordinates"), value: "" };
    case LocSelection.offset:
      return { label: t("Offset from current location"), value: "" };
  }
  if (!locationNode) { return; }
  switch (locationNode.kind) {
    case "point":
      const { pointer_type, pointer_id } = locationNode.args;
      return formatPoint(
        findPointerByTypeAndId(resources, pointer_type, pointer_id));
    case "identifier":
      const variable =
        maybeFindVariable(locationNode.args.label, resources, sequenceUuid);
      return {
        label: resourceVariableLabel(variable),
        value: locationNode.args.label,
      };
  }
};

const resourceVariableLabel = (variable: SequenceMeta | undefined) =>
  `${t("Variable")} - ${variable?.dropdown.label || t("Add new")}`;

export const getLocationState = (step: Move): {
  location: LocationNode | undefined,
  locationSelection: LocSelection | undefined,
} => {
  /** Last axis_overwrite where axis_operand is a point or identifier. */
  const overwrite = step.body?.reverse().find(x =>
    x.kind == "axis_overwrite"
    && ["point", "identifier"].includes(x.args.axis_operand.kind));
  if (overwrite?.kind == "axis_overwrite") {
    switch (overwrite.args.axis_operand.kind) {
      case "point":
        return {
          location: overwrite.args.axis_operand,
          locationSelection: LocSelection.point,
        };
      case "identifier":
        return {
          location: overwrite.args.axis_operand,
          locationSelection: LocSelection.identifier,
        };
    }
  }
  const otherOverwrites = step.body?.filter(x =>
    x.kind == "axis_overwrite"
    && !["point", "identifier"].includes(x.args.axis_operand.kind)) || [];
  if (otherOverwrites.length > 0) {
    return { location: undefined, locationSelection: LocSelection.custom };
  }
  const offsets = step.body?.filter(x =>
    x.kind == "axis_addition" && x.args.axis_operand.kind != "random") || [];
  if (offsets.length > 0) {
    return { location: undefined, locationSelection: LocSelection.offset };
  }
  return { location: undefined, locationSelection: undefined };
};

export const setSelectionFromLocation = (
  locationSelection: string | undefined,
  selection: Record<Xyz, AxisSelection | undefined>,
) => {
  const adjustValue = (axis: Xyz) => {
    switch (locationSelection) {
      case LocSelection.custom:
        return AxisSelection.custom;
    }
    return selection[axis];
  };
  return {
    x: adjustValue("x"),
    y: adjustValue("y"),
    z: adjustValue("z"),
  };
};

export const setOverwriteFromLocation = (
  locationSelection: string | undefined,
  overwrite: Record<Xyz, number | string | undefined>,
) => {
  const adjustValue = (axis: Xyz) => {
    switch (locationSelection) {
      case LocSelection.custom:
        return overwrite[axis] ?? 0;
      case LocSelection.offset:
        return undefined;
      case LocSelection.point:
        return overwrite[axis] == 0 ? undefined : overwrite[axis];
    }
    return overwrite[axis];
  };
  return {
    x: adjustValue("x"),
    y: adjustValue("y"),
    z: adjustValue("z"),
  };
};

export const setOffsetFromLocation = (
  locationSelection: string | undefined,
  offset: Record<Xyz, number | string | undefined>,
) => {
  const adjustValue = (axis: Xyz) => {
    switch (locationSelection) {
      case LocSelection.custom:
        return undefined;
      case LocSelection.offset:
        return offset[axis] ?? 0;
    }
    return offset[axis];
  };
  return {
    x: adjustValue("x"),
    y: adjustValue("y"),
    z: adjustValue("z"),
  };
};
