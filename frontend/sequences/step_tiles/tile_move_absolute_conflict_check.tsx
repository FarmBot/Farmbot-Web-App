import React from "react";
import {
  CheckConflictCaseProps, MoveAbsoluteWarningProps, HardwareFlags,
} from "../interfaces";
import { StepWarning, conflictsString } from "../step_ui";
import { some } from "lodash";
import { Vector3, Xyz } from "farmbot";
import { betterMerge } from "../../util";
import { t } from "../../i18next_wrapper";

/** Check if a planned movement will extend beyond a defined axis home. */
const checkHomeConflict =
  (props: CheckConflictCaseProps): boolean | undefined => {
    const { axis, target, hardwareFlags } = props;
    if (hardwareFlags.stopAtHome[axis]) {
      return hardwareFlags.negativeOnly[axis] ? target > 0 : target < 0;
    }
  };

/** Check if a planned movement will extend beyond a defined axis end. */
const checkExtentConflict =
  (props: CheckConflictCaseProps): boolean | undefined => {
    const { axis, target, hardwareFlags } = props;
    if (hardwareFlags.stopAtMax[axis] && hardwareFlags.axisLength[axis] !== 0) {
      return hardwareFlags.negativeOnly[axis]
        ? target < -hardwareFlags.axisLength[axis]
        : target > hardwareFlags.axisLength[axis];
    }
  };

/** Check if a planned movement will extend beyond defined axis limits. */
const checkAllConflicts =
  (props: CheckConflictCaseProps): boolean | undefined => {
    const homeConflict = checkHomeConflict(props);
    const extentConflict = checkExtentConflict(props);
    return !!(homeConflict || extentConflict);
  };

/** Default all unknown coordinate values to zero. */
const defaultToZero = (vector: Vector3 | undefined): Vector3 =>
  betterMerge({ x: 0, y: 0, z: 0 }, vector);

/** Add coordinate and offset to get final absolute position target. */
export const getPositionSum =
  (vector: Vector3 | undefined, offset: Vector3): Vector3 => {
    const coordinate = defaultToZero(vector);
    return {
      x: coordinate.x + offset.x,
      y: coordinate.y + offset.y,
      z: coordinate.z + offset.z,
    };
  };

/** Check if an axis position target is in bounds. */
const conflictForAxis =
  (vector: Vector3, hardwareFlags: HardwareFlags | undefined) =>
    (axis: Xyz): boolean | undefined => {
      if (hardwareFlags) {
        return checkAllConflicts({ axis, target: vector[axis], hardwareFlags });
      }
    };

/** Determine if location conflicts with bot settings. */
const settingConflicts = (
  coordinate: Vector3,
  hardwareFlags: HardwareFlags | undefined,
): Record<Xyz, boolean> => {
  const conflicts =
    ["x", "y", "z"].map(conflictForAxis(coordinate, hardwareFlags));
  return { x: !!conflicts[0], y: !!conflicts[1], z: !!conflicts[2] };
};

export const MoveAbsoluteWarning =
  (props: MoveAbsoluteWarningProps): React.ReactNode => {

    const conflicts = settingConflicts(props.coordinate, props.hardwareFlags);

    /** Aggregate conflict warning text for all axes. */
    const settingConflictWarning =
      t("Movement out of bounds for: ") + conflictsString(conflicts);

    return some(conflicts)
      ? <StepWarning
        warning={settingConflictWarning}
        conflicts={conflicts} />
      : <div className={"no-step-warning"} />;
  };
