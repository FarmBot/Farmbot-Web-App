import * as React from "react";
import { CheckConflictCaseProps, MoveAbsoluteWarningProps } from "../interfaces";
import { Xyz } from "../../devices/interfaces";
import { StepWarning, conflictsString } from "../step_ui/index";
import { some } from "lodash";
import { Vector3 } from "farmbot";
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

export const MoveAbsoluteWarning =
  (props: MoveAbsoluteWarningProps): JSX.Element => {

    /** Add coordinate and offset to get final absolute position target. */
    const getPositionSum = (axis: Xyz): number => {
      const coord = defaultToZero(props.vector)[axis];
      const offset = props.offset[axis];
      return coord + offset;
    };

    /** Check if an axis position target is in bounds. */
    const conflictForAxis = (axis: Xyz): boolean | undefined => {
      if (props.hardwareFlags) {
        return checkAllConflicts({
          axis,
          target: getPositionSum(axis),
          hardwareFlags: props.hardwareFlags
        });
      }
    };

    /** Determine if location conflicts with bot settings. */
    const settingConflicts = (): Record<Xyz, boolean> => {
      const conflicts = ["x", "y", "z"].map(conflictForAxis);
      return { x: !!conflicts[0], y: !!conflicts[1], z: !!conflicts[2] };
    };

    /** Get the aggregate conflict warning text for all axes. */
    const settingConflictWarning = () => {
      return t("Movement out of bounds for: ")
        + conflictsString(settingConflicts());
    };

    return some(settingConflicts())
      ? <StepWarning
        warning={settingConflictWarning()}
        conflicts={settingConflicts()} />
      : <div className={"no-step-warning"} />;
  };
