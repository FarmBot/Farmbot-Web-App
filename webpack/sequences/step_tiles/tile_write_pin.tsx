import * as React from "react";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { FBSelect } from "../../ui/new_fb_select";
import {
  setPinMode, PIN_MODES, setPinValue, currentValueSelection,
  PIN_VALUES, currentModeSelection
} from "./tile_pin_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";

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
      </Row>
    </StepContent>
  </StepWrapper>;
}
