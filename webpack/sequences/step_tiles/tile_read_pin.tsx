import * as React from "react";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { setPinMode, PIN_MODES, currentModeSelection } from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import {
  pinsAsDropDowns,
  celery2DropDown,
  setArgsDotPinNumber
} from "./pin_and_peripheral_support";

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
  const { dispatch, currentStep, index, currentSequence, installedOsVersion
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
      index={index} />
    <StepContent className={className}>
      <Row>
        <Col xs={6} md={6}>
          <label>{t("Pin")}</label>
          <FBSelect
            selectedItem={celery2DropDown(pin_number, props.resources)}
            onChange={setArgsDotPinNumber(props)}
            list={pinsAsDropDowns(props.resources, installedOsVersion)} />
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
    </StepContent>
  </StepWrapper>;
}
