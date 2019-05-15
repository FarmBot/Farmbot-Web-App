import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import {
  setPinValue, currentValueSelection, PIN_VALUES
} from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  celery2DropDown,
  setArgsDotPinNumber,
  pinsAsDropDownsWritePin
} from "./pin_and_peripheral_support";
import { t } from "../../i18next_wrapper";
import { PinMode } from "./tile_read_pin";

export function TileWritePin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  /** Make sure the generic `currentStep` provided is a WritePin step. */
  if (currentStep.kind !== "write_pin") { throw new Error("never"); }

  const PinValueField = (): JSX.Element =>
    (!(currentStep.args.pin_mode === 0) || currentStep.args.pin_value > 1)
      /** Analog pin mode: display number input for pin value. */
      ? <StepInputBox dispatch={dispatch}
        step={currentStep}
        sequence={currentSequence}
        index={index}
        field="pin_value" />
      /** Digital mode: replace pin value input with an ON/OFF dropdown. */
      : <FBSelect
        key={JSON.stringify(props.currentSequence)}
        onChange={x => setPinValue(x, props)}
        selectedItem={currentValueSelection(currentStep)}
        list={PIN_VALUES} />;

  const className = "write-pin-step";
  const { pin_number } = currentStep.args;

  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.WRITE_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={6} md={6}>
          <label>{t("Peripheral")}</label>
          <FBSelect
            key={JSON.stringify(props.currentSequence)}
            selectedItem={celery2DropDown(pin_number, props.resources)}
            onChange={setArgsDotPinNumber(props)}
            list={pinsAsDropDownsWritePin(props.resources, !!props.showPins)} />
        </Col>
        <PinMode {...props} />
        <Col xs={6} md={3}>
          <label>{t("set to")}</label>
          <PinValueField />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
