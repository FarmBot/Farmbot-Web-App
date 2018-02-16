import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import {
  changeStep,
  EMPTY_READ_PIN,
  PeripheralSelector,
  StepCheckBox
} from "./pin_and_peripheral_support";
import { PinMode } from "./tile_read_pin";

const convertToReadPin = changeStep(EMPTY_READ_PIN);

export function TileReadPeripheral(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "read-pin-step";
  const action = convertToReadPin(currentStep, currentSequence, index);

  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.READ_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index} />
    <StepContent className={className}>
      <Row>
        <Col xs={12} md={6}>
          <PeripheralSelector {...props} />
        </Col>
        <PinMode {...props} />
        <Col xs={6} md={3}>
          <StepCheckBox
            onClick={() => dispatch(action)}
            checked={false}>
            {t("Peripheral")}
          </StepCheckBox>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
