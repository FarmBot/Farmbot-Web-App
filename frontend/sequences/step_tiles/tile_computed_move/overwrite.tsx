import React from "react";
import { AxisSelection, OverwriteInputRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Xyz, Move, AxisOverwrite } from "farmbot";
import { Axis } from "../../../devices/interfaces";
import { isUndefined } from "lodash";
import { FBSelect, Row } from "../../../ui";
import { MoveStepInput } from "./input";
import { LOCATION_NODES } from "./location";

export const overwriteAxis = (
  axis: Axis,
  node: AxisOverwrite["args"]["axis_operand"] | undefined,
): AxisOverwrite[] =>
  isUndefined(node)
    ? []
    : [{ kind: "axis_overwrite", args: { axis: axis, axis_operand: node } }];

export const getOverwriteState = (step: Move, axis: Xyz): {
  selection: AxisSelection | undefined,
  overwrite: string | number | undefined,
} => {
  const overwrite = step.body?.reverse().find(x =>
    x.kind == "axis_overwrite"
    && !LOCATION_NODES.includes(x.args.axis_operand.kind)
    && x.args.axis == axis);
  if (overwrite?.kind == "axis_overwrite") {
    switch (overwrite.args.axis_operand.kind) {
      case "numeric":
        return {
          selection: AxisSelection.custom,
          overwrite: overwrite.args.axis_operand.args.number,
        };
      case "lua":
        return {
          selection: AxisSelection.lua,
          overwrite: overwrite.args.axis_operand.args.lua,
        };
      case "special_value":
        return {
          selection: overwrite.args.axis_operand.args.label as AxisSelection,
          overwrite: undefined,
        };
    }
  }
  return {
    selection: undefined,
    overwrite: undefined,
  };
};

export const getOverwriteNode = (
  overwriteValue: string | number | undefined,
  selection: AxisSelection | undefined,
  disabled: boolean,
): AxisOverwrite["args"]["axis_operand"] | undefined => {
  if (disabled) {
    return { kind: "special_value", args: { label: "current_location" } };
  }
  switch (selection) {
    case AxisSelection.safe_height:
    case AxisSelection.soil_height:
      return { kind: "special_value", args: { label: selection } };
  }
  switch (typeof overwriteValue) {
    case "string":
      return { kind: "lua", args: { lua: overwriteValue } };
    case "number":
      return { kind: "numeric", args: { number: overwriteValue } };
  }
};

export const OverwriteInputRow = (props: OverwriteInputRowProps) =>
  <Row className="grid-4-col">
    <label>
      {props.locationSelection == "custom"
        ? t("X, Y, Z (mm)")
        : t("override")}
    </label>
    {["x", "y", "z"].map((axis: Xyz) =>
      <div key={axis}>
        {showDropdown(props.selection[axis])
          ? <FBSelect
            key={props.selection[axis]}
            list={OVERWRITE_OPTIONS(axis)}
            selectedItem={getOverwriteSelection(props.selection[axis])}
            onChange={ddi =>
              props.setAxisOverwriteState(axis, ddi.value as AxisSelection)} />
          : <MoveStepInput field={"overwrite"} axis={axis}
            value={props.overwrite[axis]}
            onCommit={props.onCommit}
            onClear={() =>
              props.setAxisOverwriteState(axis, AxisSelection.none)}
            setValue={props.setAxisState("overwrite", axis, 0)} />}
      </div>)}
  </Row>;

export const OVERWRITE_OPTION_LOOKUP = () => ({
  [AxisSelection.disable]: {
    label: t("Disable axis"), value: AxisSelection.disable
  },
  [AxisSelection.custom]: {
    label: t("Custom coordinate"), value: AxisSelection.custom
  },
  [AxisSelection.soil_height]: {
    label: t("Soil height"), value: AxisSelection.soil_height
  },
  [AxisSelection.safe_height]: {
    label: t("Safe height"), value: AxisSelection.safe_height
  },
  [AxisSelection.lua]: {
    label: t("Formula"), value: AxisSelection.lua
  },
  [AxisSelection.none]: {
    label: t("None"), value: AxisSelection.none
  },
});

const OVERWRITE_OPTIONS = (axis: Xyz) =>
  [
    { label: t("None"), value: "" },
    OVERWRITE_OPTION_LOOKUP()[AxisSelection.disable],
    OVERWRITE_OPTION_LOOKUP()[AxisSelection.custom],
    ...(axis == "z"
      ? [OVERWRITE_OPTION_LOOKUP()[AxisSelection.soil_height]]
      : []),
    ...(axis == "z"
      ? [OVERWRITE_OPTION_LOOKUP()[AxisSelection.safe_height]]
      : []),
    OVERWRITE_OPTION_LOOKUP()[AxisSelection.lua],
  ];

const getOverwriteSelection = (selection: AxisSelection | undefined) =>
  OVERWRITE_OPTION_LOOKUP()[selection || AxisSelection.none];

const showDropdown = (selection: AxisSelection | undefined) =>
  ![AxisSelection.lua, AxisSelection.custom]
    .includes(selection || AxisSelection.none);

export const setOverwrite = (value: AxisSelection) => {
  switch (value) {
    case AxisSelection.lua:
      return "";
    case AxisSelection.custom:
      return 0;
    case AxisSelection.none:
      return;
  }
};
