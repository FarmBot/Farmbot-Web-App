import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { AxisStepRadio } from "../step_ui/step_radio";
import { StepInputBox } from "../inputs/step_input_box";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Home } from "farmbot";

export const TileMoveHome = (props: StepParams<Home>) =>
  <StepWrapper {...props}
    className={"move-home-step"}
    helpText={ToolTips.MOVE_TO_HOME}>
    <AxisStepRadio
      currentSequence={props.currentSequence}
      currentStep={props.currentStep}
      dispatch={props.dispatch}
      index={props.index} />
    <Row>
      <label>{t("Speed")}</label>
      <StepInputBox field={"speed"}
        dispatch={props.dispatch}
        step={props.currentStep}
        sequence={props.currentSequence}
        index={props.index} />
    </Row>
  </StepWrapper>;
