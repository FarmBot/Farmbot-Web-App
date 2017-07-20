import { TaggedResource } from "./tagged_resources";
import { UnsafeError } from "../interfaces";
import { toastErrors } from "../util";
import { Actions } from "../constants";

export function createOK(payload: TaggedResource) {
  return { type: Actions.SAVE_RESOURCE_OK, payload };
}

export function updateOK(payload: TaggedResource) {
  return { type: Actions.UPDATE_RESOURCE_OK, payload };
}

export function destroyOK(payload: TaggedResource) {
  return { type: Actions.DESTROY_RESOURCE_OK, payload };
}

/** Generalized error handler when there are not special error handling
 * requirements */
function generalizedError(payload: UnsafeError) {
  toastErrors(payload);
  return {
    type: "*_RESOURCE_NO", payload
  };
}

export let destroyNO = generalizedError;
export let createNO = generalizedError;
export let updateNO = generalizedError;
