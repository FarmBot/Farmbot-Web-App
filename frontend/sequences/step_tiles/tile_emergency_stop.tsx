import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Col, Row } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export const TileEmergencyStop = (props: StepParams) =>
  <StepWrapper
    className={"emergency-stop-step"}
    helpText={ToolTips.EMERGENCY_LOCK}
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}>
    <Row>
      <Col xs={12}>
        <p>
          {t(Content.ESTOP_STEP)}
        </p>
      </Col>
    </Row>
  </StepWrapper>;
