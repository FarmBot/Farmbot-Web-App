import * as React from "react";
import { t } from "i18next";
import { Popover, Position, PopoverInteractionKind } from "@blueprintjs/core";

export function StepWarning(warning: string) {
  return <div className="step-warning">
    <Popover
      position={Position.LEFT_TOP}
      interactionKind={PopoverInteractionKind.HOVER}
      popoverClassName={"help"} >
      <i className="fa fa-exclamation-triangle" />
      <div>
        {warning}
      </div>
    </Popover>
    &nbsp;{t("Hardware setting conflict.")}
  </div>;
}
