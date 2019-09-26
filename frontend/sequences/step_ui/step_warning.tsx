import * as React from "react";
import { Popover, Position, PopoverInteractionKind } from "@blueprintjs/core";
import { Xyz } from "farmbot";
import { t } from "../../i18next_wrapper";

interface StepWarningProps {
  warning: string;
  conflicts?: Record<Xyz, boolean>;
}

const TITLE_BASE = t("Hardware setting conflict");

export const conflictsString = (conflicts: Record<Xyz, boolean>) => {
  const conflictAxes: string[] = [];
  Object.entries(conflicts)
    .map(([label, value]) => {
      if (value) { conflictAxes.push(label); }
    });
  return conflictAxes.join(", ");
};

export function StepWarning(props: StepWarningProps) {
  const { conflicts, warning } = props;
  const warningTitle = () => {
    return conflicts
      ? TITLE_BASE + ": " + conflictsString(conflicts)
      : TITLE_BASE;
  };
  return <div className="step-warning">
    <Popover
      position={Position.RIGHT_TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={"help"}>
      <i className="fa fa-exclamation-triangle" />
      <div>
        {warning}
      </div>
    </Popover>
    &nbsp;{warningTitle()}
  </div>;
}
