import React from "react";
import { StepParams } from "../interfaces";
import { Content } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";
import { ALLOWED_PACKAGES, Reboot } from "farmbot";
import { editStep } from "../../api/crud";
import { StepRadio } from "../step_ui/step_radio";
import { DevSettings } from "../../settings/dev/dev_support";

const PACKAGE_CHOICES = (): Record<ALLOWED_PACKAGES, string> => ({
  arduino_firmware: t("Just the Arduino"),
  farmbot_os: t("Entire system")
});

type RELEVANT_KEYS = "currentStep" | "currentSequence" | "index" | "dispatch";
type RebootEditProps = Pick<StepParams<Reboot>, RELEVANT_KEYS>;

export const rebootExecutor =
  (pkg: ALLOWED_PACKAGES) => (step: Reboot) => {
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

export const TileReboot = (props: StepParams<Reboot>) =>
  <StepWrapper {...props}
    className={"reboot-step"}
    helpText={Content.RESTART_FARMBOT}>
    {DevSettings.futureFeaturesEnabled() &&
      <StepRadio
        choices={Object.keys(PACKAGE_CHOICES()) as ALLOWED_PACKAGES[]}
        choiceLabelLookup={PACKAGE_CHOICES()}
        currentChoice={props.currentStep.args.package as ALLOWED_PACKAGES}
        onChange={editTheRebootStep(props)} />}
  </StepWrapper>;
