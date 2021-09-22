import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row } from "../../ui";
import { PinSelect } from "./pin_support";
import { TogglePin } from "farmbot";

export const TileTogglePin = (props: StepParams<TogglePin>) =>
  <StepWrapper {...props}
    className={"toggle-pin-step"}
    helpText={ToolTips.TOGGLE_PIN}>
    <Row>
      <PinSelect {...props} />
    </Row>
  </StepWrapper>;
