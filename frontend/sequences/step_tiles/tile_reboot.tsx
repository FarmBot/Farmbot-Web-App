import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "../../i18next_wrapper";
import { Row, Col } from "../../ui";
import { ALLOWED_PACKAGES, SequenceBodyItem, Reboot } from "farmbot";
import { editStep } from "../../api/crud";

type StringMap = Record<string, string>;

interface MultiChoiceRadioProps<T extends StringMap> {
  uuid: string;
  choices: T;
  currentChoice: keyof T;
  onChange(key: keyof T): void;
}

export const MultiChoiceRadio =
  <T extends StringMap>(props: MultiChoiceRadioProps<T>) => {
    const choices = Object.keys(props.choices);
    return <Row>
      <Col xs={12}>
        <div className="bottom-content">
          <div className="channel-fields">
            <form>
              {choices.map((choice, i) =>
                <div key={`${props.uuid} ${i}`} style={{ display: "inline" }}>
                  <label>
                    <input type="radio"
                      value={choice}
                      onChange={() => props.onChange(choice)}
                      checked={props.currentChoice === choice} />
                    {t(props.choices[choice])}
                  </label>
                </div>)}
            </form>
          </div>
        </div>
      </Col>
    </Row>;
  };

const PACKAGE_CHOICES: Record<ALLOWED_PACKAGES, string> = {
  "arduino_firmware": "Just the Arduino",
  "farmbot_os": "Entire system"
};

function assertReboot(x: SequenceBodyItem): asserts x is Reboot {
  if (x.kind !== "reboot") {
    throw new Error("Impossible");
  }
}

type RELEVANT_KEYS = "currentStep" | "currentSequence" | "index" | "dispatch";
type RebootEditProps = Pick<StepParams, RELEVANT_KEYS>;

export const rebootExecutor =
  (pkg: ALLOWED_PACKAGES) => (step: SequenceBodyItem) => {
    assertReboot(step);
    step.args.package = pkg;
  };

export const editTheRebootStep =
  (props: RebootEditProps) => (pkg: ALLOWED_PACKAGES) => {
    const { currentStep, index, currentSequence } = props;
    props.dispatch(editStep({
      step: currentStep,
      index,
      sequence: currentSequence,
      executor: rebootExecutor(pkg),
    }));
  };

export function TileReboot(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "set-zero-step";
  assertReboot(currentStep);
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.REBOOT}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <MultiChoiceRadio
        uuid={currentSequence.uuid + index}
        choices={PACKAGE_CHOICES}
        currentChoice={currentStep.args.package as ALLOWED_PACKAGES}
        onChange={editTheRebootStep(props)} />
    </StepContent>
  </StepWrapper>;
}
