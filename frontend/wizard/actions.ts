import { TaggedWizardStepResult } from "farmbot";
import { WizardStepResult } from "farmbot/dist/resources/api_resources";
import { destroy, edit, initSave, save } from "../api/crud";
import { t } from "../i18next_wrapper";

export const addOrUpdateWizardStepResult = (
  wizardStepResults: TaggedWizardStepResult[],
  stepResult: WizardStepResult,
) => (dispatch: Function) => {
  const result = wizardStepResults
    .filter(result => result.body.slug == stepResult.slug)[0];
  if (result) {
    dispatch(edit(result, stepResult));
    return dispatch(save(result.uuid));
  } else {
    return dispatch(initSave("WizardStepResult", stepResult));
  }
};

export const destroyAllWizardStepResults =
  (wizardStepResults: TaggedWizardStepResult[]) =>
    (dispatch: Function) =>
      confirm(t("Are you sure you want to delete all setup progress?")) &&
      Promise.all(wizardStepResults.map(result =>
        dispatch(destroy(result.uuid))));
