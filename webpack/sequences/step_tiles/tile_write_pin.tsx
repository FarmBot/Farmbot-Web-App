import * as React from "react";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import {
  setPinMode, PIN_MODES, setPinValue, currentValueSelection,
  PIN_VALUES, currentModeSelection
} from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  StepCheckBox,
  changeStep,
  EMPTY_WRITE_PERIPHERAL
} from "./pin_and_peripheral_support";

const convertToWritePeripheral = changeStep(EMPTY_WRITE_PERIPHERAL);

export function TileWritePin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const pinValueField = () => {
    if (currentStep.kind === "write_pin") {
      if (!(currentStep.args.pin_mode === 0) || currentStep.args.pin_value > 1) {
        return <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="pin_value" />;
      } else {
        return <FBSelect
          onChange={(x) => setPinValue(x, props)}
          selectedItem={currentValueSelection(currentStep)}
          list={PIN_VALUES} />;
      }
    }
  };
  const className = "write-pin-step";
  const action = convertToWritePeripheral(currentStep, currentSequence, index);

  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.WRITE_PIN}
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
          <label>{t("Value")}</label>
          {pinValueField()}
        </Col>
        <Col xs={6} md={3}>
          <label>{t("Pin Mode")}</label>
          <FBSelect
            onChange={(x) => setPinMode(x, props)}
            selectedItem={currentModeSelection(currentStep)}
            list={PIN_MODES} />
        </Col>
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
