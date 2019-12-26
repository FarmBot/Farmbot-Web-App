import { TaggedResource, SpecialStatus } from "farmbot";
import { UnsafeError } from "../interfaces";
import { Actions } from "../constants";
import { toastErrors } from "../toast_errors";
import { stopTracking } from "../connectivity/data_consistency";

export function saveOK(payload: TaggedResource) {
  return { type: Actions.SAVE_RESOURCE_OK, payload };
}

export function destroyOK(payload: TaggedResource) {
  return { type: Actions.DESTROY_RESOURCE_OK, payload };
}

export interface GeneralizedError {
  err: UnsafeError;
  uuid: string;
  /** Used to rollback the status of the failed resource.
   * If we didn't do this, resources would go from `DIRTY => NONE` even though
   * they are still DIRTY. */
  statusBeforeError: SpecialStatus;
}
/** Generalized error handler when there are not special error handling
 * requirements */
export const generalizedError = (payload: GeneralizedError) => {
  const badStatus = payload.statusBeforeError == SpecialStatus.SAVING;
  if (badStatus) {
    /** If, somehow, a `SAVING` status sneaks in, default it to DIRTY. */
    payload.statusBeforeError = SpecialStatus.DIRTY;
  }
  toastErrors(payload);
  stopTracking(payload.uuid);
  return { type: Actions._RESOURCE_NO, payload };
};

export const destroyNO = generalizedError;
export const createNO = generalizedError;
export const updateNO = generalizedError;
