import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "../../i18next_wrapper";
import { ALLOWED_PACKAGES, SequenceBodyItem, Reboot } from "farmbot";
import { editStep } from "../../api/crud";
// import { StepRadio } from "../step_ui/step_radio";
// const PACKAGE_CHOICES = (): Record<ALLOWED_PACKAGES, string> => ({
//   "arduino_firmware": t("Just the Arduino"),
//   "farmbot_os": t("Entire system")
// });

function assertReboot(x: SequenceBodyItem): asserts x is Reboot {
  if (x.kind !== "reboot") {
    throw new Error(`${x.kind} is not "reboot"`);
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
  const className = "reboot-step";
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
      <p>
        {t(ToolTips.REBOOT)}
      </p>
      {/* <StepRadio
        choices={Object.keys(PACKAGE_CHOICES())}
        choiceLabelLookup={PACKAGE_CHOICES()}
        currentChoice={currentStep.args.package as ALLOWED_PACKAGES}
        onChange={editTheRebootStep(props)} /> */}
    </StepContent>
  </StepWrapper>;
}
