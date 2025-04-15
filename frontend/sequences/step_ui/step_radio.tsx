import React from "react";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import {
  TaggedSequence, ALLOWED_AXIS, FindHome, Home, Calibrate, Zero,
} from "farmbot";
import { editStep } from "../../api/crud";

export interface StepRadioProps<T extends string> {
  choices: T[];
  choiceLabelLookup: Record<T, string>;
  currentChoice: T;
  onChange(key: T): void;
}

export const StepRadio = <T extends string>(props: StepRadioProps<T>) =>
  <Row>
    <div className="row sequence-step-radio-grid double-gap">
      {props.choices.map((choice, i) =>
        <div className={"row half-gap grid-exp-2"} key={i}>
          <input type={"radio"} name={choice}
            value={choice}
            onChange={() => props.onChange(choice)}
            checked={props.currentChoice === choice} />
          <label>{t(props.choiceLabelLookup[choice])}</label>
        </div>)}
    </div>
  </Row>;

type AxisStep = FindHome | Home | Calibrate | Zero;

export interface AxisStepRadioProps {
  currentSequence: TaggedSequence;
  currentStep: AxisStep;
  dispatch: Function;
  index: number;
}

export const AxisStepRadio = (props: AxisStepRadioProps) => {
  const AXIS_CHOICES: ALLOWED_AXIS[] = ["x", "y", "z", "all"];
  const CHOICE_LABELS = AXIS_CHOICES.reduce((acc, axis) => {
    acc[axis] = axis;
    return acc;
  }, {} as Record<ALLOWED_AXIS, string>);

  const handleUpdate = (axis: ALLOWED_AXIS) => {
    const { currentStep, index, currentSequence } = props;
    props.dispatch(editStep({
      step: currentStep,
      index,
      sequence: currentSequence,
      executor: (step: AxisStep) => step.args.axis = axis,
    }));
  };

  return <StepRadio
    choices={AXIS_CHOICES}
    choiceLabelLookup={CHOICE_LABELS}
    currentChoice={props.currentStep.args.axis}
    onChange={handleUpdate} />;
};
