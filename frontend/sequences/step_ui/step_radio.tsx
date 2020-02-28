import * as React from "react";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";
import {
  TaggedSequence, ALLOWED_AXIS, FindHome, Home, Calibrate, Zero
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
    <Col xs={12}>
      <div className="bottom-content">
        <div className="channel-fields">
          <form>
            {props.choices.map((choice, i) =>
              <div key={i} style={{ display: "inline" }}>
                <label>
                  <input type="radio" name={choice}
                    value={choice}
                    onChange={() => props.onChange(choice)}
                    checked={props.currentChoice === choice} />
                  {t(props.choiceLabelLookup[choice])}
                </label>
              </div>)}
          </form>
        </div>
      </div>
    </Col>
  </Row>;

type AxisStep = FindHome | Home | Calibrate | Zero;

export interface AxisStepRadioProps {
  currentSequence: TaggedSequence;
  currentStep: AxisStep;
  dispatch: Function;
  index: number;
  label: string;
}

export const AxisStepRadio = (props: AxisStepRadioProps) => {
  const AXIS_CHOICES: ALLOWED_AXIS[] = ["x", "y", "z", "all"];
  const CHOICE_LABELS = AXIS_CHOICES.reduce((acc, axis) => {
    acc[axis] = `${t(props.label)} ${axis}`;
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
