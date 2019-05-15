import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { setPinMode, PIN_MODES, currentModeSelection } from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  pinsAsDropDownsReadPin,
  celery2DropDown,
  setArgsDotPinNumber
} from "./pin_and_peripheral_support";
import { t } from "../../i18next_wrapper";

export function PinMode(props: StepParams) {
  return <Col xs={6} md={3}>
    <label>{t("Mode")}</label>
    <FBSelect
      key={JSON.stringify(props.currentSequence)}
      onChange={(x) => setPinMode(x, props)}
      selectedItem={currentModeSelection(props.currentStep)}
      list={PIN_MODES} />
  </Col>;

}
export function TileReadPin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence
  } = props;
  const className = "read-pin-step";
  if (currentStep.kind !== "read_pin") { throw new Error("never"); }
  const { pin_number } = currentStep.args;
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.READ_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={6} md={6}>
          <label>{t("sensor or peripheral")}</label>
          <FBSelect
            key={JSON.stringify(props.currentSequence)}
            selectedItem={celery2DropDown(pin_number, props.resources)}
            onChange={setArgsDotPinNumber(props)}
            list={pinsAsDropDownsReadPin(props.resources, !!props.showPins)} />
        </Col>
        <PinMode {...props} />
        <Col xs={6} md={3}>
          <label>{t("Data Label")}</label>
          <StepInputBox dispatch={dispatch}
            index={index}
            step={currentStep}
            sequence={currentSequence}
            field="label" />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
