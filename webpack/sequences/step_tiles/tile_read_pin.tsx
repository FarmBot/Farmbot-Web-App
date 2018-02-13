import * as React from "react";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { setPinMode, PIN_MODES, currentModeSelection } from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import { EMPTY_READ_PERIPHERAL, changeStep } from "./pin_and_peripheral_support";

const convertToReadPeripheral = changeStep(EMPTY_READ_PERIPHERAL);

export function PinMode(props: StepParams) {
  return <Col xs={6} md={3}>
    <label>{t("Pin Mode")}</label>
    <FBSelect
      onChange={(x) => setPinMode(x, props)}
      selectedItem={currentModeSelection(props.currentStep)}
      list={PIN_MODES} />
  </Col>;

}
export function TileReadPin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "read-pin-step";
  if (currentStep.kind != "read_pin") { throw new Error("read_pin only"); }
  const payl = convertToReadPeripheral(currentStep, currentSequence, index);

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
        <Col xs={6} md={3}>
          <label>{t("Pin Number")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field="pin_number" />
        </Col>
        <Col xs={6} md={3}>
          <label>{t("Data Label")}</label>
          <StepInputBox dispatch={dispatch}
            index={index}
            step={currentStep}
            sequence={currentSequence}
            field="label" />
        </Col>
        <PinMode {...props} />
      </Row>
      <Row>
        <Col xs={6} md={6}>
          <label>
            <a onClick={() => dispatch(payl)}>
              {t("Use existing peripheral instead")}
            </a>
          </label>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
