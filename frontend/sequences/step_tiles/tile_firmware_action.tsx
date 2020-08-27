import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";

export const TileFirmwareAction = (props: StepParams) =>
  <StepWrapper
    className={"firmware-action-step"}
    helpText={ToolTips.FIRMWARE_ACTION}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <label>{t("System")}</label>
        <StepInputBox field={"package"}
          dispatch={props.dispatch}
          step={props.currentStep}
          sequence={props.currentSequence}
          index={props.index}
          fieldOverride={true} />
      </Col>
    </Row>
  </StepWrapper>;
