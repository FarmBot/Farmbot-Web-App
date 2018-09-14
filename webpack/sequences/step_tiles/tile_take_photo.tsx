import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { Col, Row } from "../../ui/index";
import { t } from "i18next";
import { Link } from "../../link";

export function TileTakePhoto(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "take-photo-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.TAKE_PHOTO}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <p>
            {t("Photos are viewable from the")}
            <Link to="/app/farmware">
              farmware {t("page")}
            </Link>.
          </p>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
