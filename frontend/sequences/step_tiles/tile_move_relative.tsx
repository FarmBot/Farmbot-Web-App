import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";

export const TileMoveRelative = (props: StepParams) => {
  const { dispatch, currentStep, index, currentSequence } = props;
  return <StepWrapper {...props}
    className={"move-relative-step"}
    helpText={ToolTips.MOVE_RELATIVE}>
    <Row>
      <Col xs={6} md={3}>
        <label>{t("X (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="x" />
      </Col>
      <Col xs={6} md={3}>
        <label>{t("Y (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="y" />
      </Col>
      <Col xs={6} md={3}>
        <label>{t("Z (mm)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="z" />
      </Col>
      <Col xs={6} md={3}>
        <label>{t("Speed (%)")}</label>
        <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="speed" />
      </Col>
    </Row>
  </StepWrapper>;
};
