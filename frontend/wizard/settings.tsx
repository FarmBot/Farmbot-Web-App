import React from "react";
import { t } from "../i18next_wrapper";
import {
  completeSetup, destroyAllWizardStepResults, resetSetup,
} from "./actions";
import { SetupWizardSettingsProps } from "./interfaces";

export const SetupWizardSettings = (props: SetupWizardSettingsProps) =>
  <div className={"grid grid-exp-1"}>
    <label>
      {t("Restart setup wizard")}
    </label>
    <button className={"fb-button red"} onClick={() => {
      props.dispatch(destroyAllWizardStepResults(
        props.wizardStepResults));
      props.dispatch(resetSetup(props.device));
    }}>
      {t("restart")}
    </button>
    <label>
      {t("Complete setup wizard")}
    </label>
    <button className={"fb-button green"} onClick={() =>
      props.dispatch(completeSetup(props.device))}>
      {t("complete")}
    </button>
  </div>;
