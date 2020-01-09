import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";
import { SetServoAngle } from "farmbot";
import { editStep } from "../../api/crud";
import { StepRadio } from "../step_ui/step_radio";

const PIN_CHOICES = ["4", "5", "6", "11"];
const CHOICE_LABELS = () => PIN_CHOICES.reduce((acc, pinNumber) => {
  acc[pinNumber] = `${t("Pin")} ${pinNumber}`;
  return acc;
}, {} as Record<string, string>);

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
  const { currentStep } = props;
  const num = (currentStep as SetServoAngle).args.pin_number;
  if (typeof num !== "number") { throw new Error("NO!"); }
  const onChange = pinNumberChanger(props);

  return <StepRadio
    choices={PIN_CHOICES}
    choiceLabelLookup={CHOICE_LABELS()}
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
        <Col lg={4} xs={6}>
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
        <Col lg={8} xs={6}>
          <label>{t("Servo pin")}</label>
          <ServoPinSelection {...props} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
