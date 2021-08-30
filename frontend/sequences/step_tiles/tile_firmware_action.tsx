import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";

export const TileFirmwareAction = (props: StepParams) =>
  <StepWrapper {...props}
    className={"firmware-action-step"}
    helpText={ToolTips.FIRMWARE_ACTION}>
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
