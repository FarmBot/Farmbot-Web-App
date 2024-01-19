import { TaggedDevice, TaggedWizardStepResult } from "farmbot";
import {
  DeviceAccountSettings, WizardStepResult,
} from "farmbot/dist/resources/api_resources";
import moment from "moment";
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
      confirm(t("Are you sure you want to delete all setup progress?"))
        ? Promise.all(wizardStepResults.map(result =>
          dispatch(destroy(result.uuid))))
        : Promise.reject("Cancelled");

export const completeSetup = (device: TaggedDevice | undefined) =>
  device &&
  setDeviceProperty(device, {
    setup_completed_at: "" + moment().toISOString()
  });

export const resetSetup = (device: TaggedDevice | undefined) =>
  device && setDeviceProperty(device, {
    // eslint-disable-next-line no-null/no-null
    setup_completed_at: null as unknown as undefined
  });

export const setOrderNumber = (device: TaggedDevice, value: string) =>
  setDeviceProperty(device, {
    // eslint-disable-next-line no-null/no-null
    fb_order_number: value ? value : null as unknown as undefined
  });

const setDeviceProperty =
  (device: TaggedDevice, update: Partial<DeviceAccountSettings>) =>
    (dispatch: Function) => {
      dispatch(edit(device, update));
      dispatch(save(device.uuid));
    };
