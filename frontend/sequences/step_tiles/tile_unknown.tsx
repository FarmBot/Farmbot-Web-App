import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { Col, Row } from "../../ui/index";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { LegalArgString } from "farmbot";

export function TileUnknown(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "unknown-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.UNKNOWN_STEP}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <p>{t(ToolTips.UNKNOWN_STEP)}</p>
          <code>{JSON.stringify(currentStep)}</code>
          {Object.keys(currentStep.args).sort().map(arg =>
            <div key={arg}>
              <label>{arg}</label>
              <StepInputBox
                dispatch={dispatch}
                step={currentStep}
                sequence={currentSequence}
                index={index}
                fieldOverride={true}
                field={arg as LegalArgString} />
            </div>)}
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
