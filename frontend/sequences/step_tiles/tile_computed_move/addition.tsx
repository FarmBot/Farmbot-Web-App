import React from "react";
import { Move, Xyz, AxisAddition, Random } from "farmbot";
import { Row, BlurableInput } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { VarianceInputRowProps, OffsetInputRowProps } from "./interfaces";
import { MoveStepInput } from "./input";
import { isUndefined } from "lodash";

export const axisAddition = (
  axis: Xyz,
  node: AxisAddition["args"]["axis_operand"] | undefined,
): AxisAddition[] =>
  isUndefined(node) || (node.kind == "random" && node.args.variance == 0)
    ? []
    : [{ kind: "axis_addition", args: { axis: axis, axis_operand: node } }];

export const getOffsetState = (step: Move, axis: Xyz) => {
  const offset = step.body?.find(x =>
    x.kind == "axis_addition"
    && x.args.axis_operand.kind != "random"
    && x.args.axis == axis);
  if (offset?.kind == "axis_addition") {
    switch (offset.args.axis_operand.kind) {
      case "numeric":
        return offset.args.axis_operand.args.number;
      case "lua":
        return offset.args.axis_operand.args.lua;
    }
  }
};

export const getOffsetNode = (
  offsetValue: string | number | undefined,
  disabled: boolean,
): AxisAddition["args"]["axis_operand"] | undefined => {
  if (isUndefined(offsetValue) || disabled) { return; }
  switch (typeof offsetValue) {
    case "string":
      return { kind: "lua", args: { lua: offsetValue } };
    case "number":
      return { kind: "numeric", args: { number: offsetValue } };
  }
};

export const OffsetInputRow = (props: OffsetInputRowProps) =>
  <Row className="grid-4-col">
    <label>
      {t("offset")}
    </label>
    {["x", "y", "z"].map((axis: Xyz) =>
      <div key={axis}>
        <MoveStepInput field={"offset"} axis={axis}
          value={props.offset[axis]}
          disabled={props.disabledAxes[axis]}
          onCommit={props.onCommit}
          setValue={props.setAxisState("offset", axis, 0)} />
      </div>)}
  </Row>;

export const getVarianceState = (step: Move, axis: Xyz) => {
  const variance = step.body?.find(x =>
    x.kind == "axis_addition"
    && x.args.axis == axis
    && x.args.axis_operand.kind == "random");
  if (variance?.kind == "axis_addition") {
    switch (variance.args.axis_operand.kind) {
      case "random":
        return variance.args.axis_operand.args.variance;
    }
  }
};

export const getVarianceNode = (
  varianceValue: number | undefined,
  disabled: boolean,
): Random | undefined => {
  if (isUndefined(varianceValue) || disabled) { return; }
  return { kind: "random", args: { variance: varianceValue } };
};

export const VarianceInputRow = (props: VarianceInputRowProps) =>
  <Row className="grid-4-col">
    <label>
      {t("Variance")}
    </label>
    {["x", "y", "z"].map((axis: Xyz) =>
      <div key={axis}>
        <BlurableInput
          type={"number"}
          name={"variance.x"}
          value={props.variance[axis] || 0}
          min={0}
          disabled={props.disabledAxes[axis]}
          onCommit={props.onCommit("variance", axis)} />
      </div>)}
  </Row>;
