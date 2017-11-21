import { TaggedResource } from "./tagged_resources";
import { UnsafeError } from "../interfaces";
import { Actions } from "../constants";
import { toastErrors } from "../toast_errors";
// import { stopTracking } from "../connectivity/data_consistency";

export function createOK(payload: TaggedResource) {
  return { type: Actions.SAVE_RESOURCE_OK, payload };
}

export function updateOK(payload: TaggedResource) {
  return { type: Actions.UPDATE_RESOURCE_OK, payload };
}

export function destroyOK(payload: TaggedResource) {
  return { type: Actions.DESTROY_RESOURCE_OK, payload };
}

export interface GeneralizedError {
  err: UnsafeError;
  uuid: string;
}
/** Generalized error handler when there are not special error handling
 * requirements */
export const generalizedError = (payload: GeneralizedError) => {
  toastErrors(payload);
  console.log("L-O-O-K");
  // stopTracking(payload.uuid);
  return { type: Actions._RESOURCE_NO, payload };
};

export let destroyNO = generalizedError;
export let createNO = generalizedError;
export let updateNO = generalizedError;
