import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";

export const TileWait = (props: StepParams) =>
  <StepWrapper {...props}
    className={"wait-step"}
    helpText={ToolTips.WAIT}>
    <Row>
      <Col xs={6}>
        <label>{t("Time in milliseconds")}</label>
        <StepInputBox field={"milliseconds"}
          dispatch={props.dispatch}
          step={props.currentStep}
          sequence={props.currentSequence}
          index={props.index} />
      </Col>
    </Row>
  </StepWrapper>;
