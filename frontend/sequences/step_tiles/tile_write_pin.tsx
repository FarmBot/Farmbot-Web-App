import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { PinSelect, PinModeDropdown, PinValueField } from "./pin_support";
import { StepWrapper } from "../step_ui";
import { WritePin } from "farmbot";

export const TileWritePin = (props: StepParams<WritePin>) =>
  <StepWrapper {...props}
    className={"write-pin-step"}
    helpText={ToolTips.WRITE_PIN}>
    <div className="grid">
      <PinSelect {...props} />
      <PinModeDropdown {...props} />
      <PinValueField {...props} />
    </div>
  </StepWrapper>;
