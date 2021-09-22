import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { PinSelect, PinModeDropdown, PinValueField } from "./pin_support";
import { StepWrapper } from "../step_ui";
import { Row } from "../../ui";
import { WritePin } from "farmbot";

export const TileWritePin = (props: StepParams<WritePin>) =>
  <StepWrapper {...props}
    className={"write-pin-step"}
    helpText={ToolTips.WRITE_PIN}>
    <Row>
      <PinSelect {...props} />
      <PinModeDropdown {...props} />
      <PinValueField {...props} />
    </Row>
  </StepWrapper>;
