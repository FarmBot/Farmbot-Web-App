import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";
import { MultiChoiceRadio } from "./tile_reboot";
import { SetServoAngle } from "farmbot";
import { editStep } from "../../api/crud";

const PACKAGE_CHOICES: Record<string, string> = {
  "4": "Pin 4",
  "5": "Pin 5",
};

type Keys =
  | "dispatch"
  | "currentStep"
  | "currentSequence"
  | "index";
type Props = Pick<StepParams, Keys>;

export const createServoEditFn = (y: string) => (x: SetServoAngle) => {
  x.args.pin_number = parseInt(y, 10);
};

export const pinNumberChanger = (props: Props) => (y: string) => {
  props.dispatch(editStep({
    step: props.currentStep,
    sequence: props.currentSequence,
    index: props.index,
    executor: createServoEditFn(y)
  }));
};

export function ServoPinSelection(props: Props) {
  const { currentSequence, index, currentStep } = props;
  const num = (currentStep as SetServoAngle).args.pin_number;
  if (typeof num !== "number") { throw new Error("NO!"); }
  const onChange = pinNumberChanger(props);

  return <MultiChoiceRadio
    uuid={currentSequence.uuid + index}
    choices={PACKAGE_CHOICES}
    currentChoice={"" + num}
    onChange={onChange} />;
}

export function TileSetServoAngle(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "set-servo-angle-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.SET_SERVO_ANGLE}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <label>{t("Servo pin")}</label>
          <ServoPinSelection {...props} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <label>
            {t("Servo angle (0-180)")}
          </label>
          <StepInputBox
            dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field={"pin_value"} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;

}
