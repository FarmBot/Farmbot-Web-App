import React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";
import { SetServoAngle, TaggedSequence } from "farmbot";
import { editStep } from "../../api/crud";
import { StepRadio } from "../step_ui/step_radio";

const PIN_CHOICES = ["4", "5", "6", "11"];
const CHOICE_LABELS = () => PIN_CHOICES.reduce((acc, pinNumber) => {
  acc[pinNumber] = pinNumber;
  return acc;
}, {} as Record<string, string>);

interface SetServoAngleProps {
  currentSequence: TaggedSequence;
  currentStep: SetServoAngle;
  dispatch: Function;
  index: number;
}

export const createServoEditFn = (y: string) => (x: SetServoAngle) => {
  x.args.pin_number = parseInt(y, 10);
};

export const pinNumberChanger = (props: SetServoAngleProps) => (y: string) => {
  props.dispatch(editStep({
    step: props.currentStep,
    sequence: props.currentSequence,
    index: props.index,
    executor: createServoEditFn(y)
  }));
};

export function ServoPinSelection(props: SetServoAngleProps) {
  const { currentStep } = props;
  const num = currentStep.args.pin_number;
  if (typeof num !== "number") { throw new Error("NO!"); }
  const onChange = pinNumberChanger(props);

  return <StepRadio
    choices={PIN_CHOICES}
    choiceLabelLookup={CHOICE_LABELS()}
    currentChoice={"" + num}
    onChange={onChange} />;
}

export const TileSetServoAngle = (props: StepParams<SetServoAngle>) =>
  <StepWrapper {...props}
    className={"set-servo-angle-step"}
    helpText={ToolTips.SET_SERVO_ANGLE}>
    <div className="grid">
      <div className="row grid-2-col">
        <label>{t("Servo pin")}</label>
        <ServoPinSelection {...props} />
      </div>
      <div className="row grid-2-col">
        <label>
          {t("Angle (0-180)")}
        </label>
        <StepInputBox
          field={"pin_value"}
          dispatch={props.dispatch}
          step={props.currentStep}
          sequence={props.currentSequence}
          index={props.index} />
      </div>
    </div>
  </StepWrapper>;
