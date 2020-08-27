import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row } from "../../ui/index";
import { PinSelect } from "./pin_support";
import { TogglePin } from "farmbot";

export const TileTogglePin = (props: StepParams<TogglePin>) =>
  <StepWrapper
    className={"toggle-pin-step"}
    helpText={ToolTips.TOGGLE_PIN}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}>
    <Row>
      <PinSelect {...props} />
    </Row>
  </StepWrapper>;
