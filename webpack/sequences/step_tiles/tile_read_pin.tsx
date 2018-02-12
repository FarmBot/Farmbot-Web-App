import * as React from "react";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { setPinMode, PIN_MODES, currentModeSelection } from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";
import { editStep } from "../../api/crud";
import { SequenceBodyItem } from "farmbot";
import { TaggedSequence } from "../../resources/tagged_resources";

export function convertToReadPeripheral(step: Readonly<SequenceBodyItem>,
  sequence: Readonly<TaggedSequence>,
  index: number) {
  return editStep({
    step,
    sequence,
    index,
    executor(c) { c = { kind: "read_peripheral", args: { peripheral_id: 0 } }; }
  });
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
        <Col xs={6} md={3}>
          <label>{t("Pin Mode")}</label>
          <FBSelect
            onChange={(x) => setPinMode(x, props)}
            selectedItem={currentModeSelection(currentStep)}
            list={PIN_MODES} />
        </Col>
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
