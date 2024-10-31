import React from "react";
import { Xyz, SpeedOverwrite, Move } from "farmbot";
import { SpeedInputRowProps } from "./interfaces";
import { Row } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { MoveStepInput } from "./input";
import { isUndefined } from "lodash";

export const speedOverwrite = (
  axis: Xyz,
  node: SpeedOverwrite["args"]["speed_setting"] | undefined,
): SpeedOverwrite[] =>
  isUndefined(node) || (node.kind == "numeric" && node.args.number == 100)
    ? []
    : [{ kind: "speed_overwrite", args: { axis, speed_setting: node } }];

export const getSpeedState = (step: Move, axis: Xyz) => {
  const speedOverwriteItem = step.body?.find(x =>
    x.kind == "speed_overwrite" && x.args.axis == axis);
  if (speedOverwriteItem?.kind == "speed_overwrite") {
    switch (speedOverwriteItem.args.speed_setting.kind) {
      case "numeric":
        return speedOverwriteItem.args.speed_setting.args.number;
      case "lua":
        return speedOverwriteItem.args.speed_setting.args.lua;
    }
  }
};

export const getSpeedNode = (
  speedValue: string | number | undefined,
  disabled: boolean,
): SpeedOverwrite["args"]["speed_setting"] | undefined => {
  if (isUndefined(speedValue) || disabled) { return; }
  switch (typeof speedValue) {
    case "string":
      return { kind: "lua", args: { lua: speedValue } };
    case "number":
      return { kind: "numeric", args: { number: speedValue } };
  }
};

export const SpeedInputRow = (props: SpeedInputRowProps) =>
  <Row className="grid-4-col">
    <label>
      {t("Speed (%)")}
    </label>
    {["x", "y", "z"].map((axis: Xyz) =>
      <div key={axis}>
        <MoveStepInput field={"speed"} axis={axis}
          value={props.speed[axis]}
          onCommit={props.onCommit} min={1} max={100}
          disabled={props.disabledAxes[axis]} defaultValue={100}
          setValue={props.setAxisState("speed", axis, 100)} />
      </div>)}
  </Row>;
