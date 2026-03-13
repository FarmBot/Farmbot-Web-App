import { TaggedResource, SpecialStatus } from "farmbot";
import { UnsafeError } from "../interfaces";
import { Actions } from "../constants";
import { toastErrors } from "../toast_errors";

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

export const sanitizeError = (err: UnsafeError): UnsafeError => {
  if (!err || typeof err !== "object") { return err; }

  const safeError: Record<string, unknown> = {};
  const maybeError = err as Record<string, unknown>;

  typeof maybeError.message === "string" &&
    (safeError.message = maybeError.message);
  typeof maybeError.name === "string" &&
    (safeError.name = maybeError.name);
  typeof maybeError.stack === "string" &&
    (safeError.stack = maybeError.stack);

  const response = maybeError.response;
  if (response && typeof response === "object") {
    const maybeResponse = response as Record<string, unknown>;
    safeError.response = {
      data: maybeResponse.data,
      status: maybeResponse.status,
      statusText: maybeResponse.statusText,
    };
  }

  return safeError;
};

/** Generalized error handler when there are not special error handling
 * requirements */
export const generalizedError = (payload: GeneralizedError) => {
  const badStatus = payload.statusBeforeError == SpecialStatus.SAVING;
  /** If, somehow, a `SAVING` status sneaks in, default it to DIRTY. */
  const statusBeforeError = badStatus
    ? SpecialStatus.DIRTY
    : payload.statusBeforeError;
  toastErrors(payload);
  // Lazy-load to avoid circular dependencies during test runs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { stopTracking } = require("../connectivity/data_consistency");
  stopTracking(payload.uuid);
  return {
    type: Actions._RESOURCE_NO,
    payload: {
      ...payload,
      err: sanitizeError(payload.err),
      statusBeforeError,
    }
  };
};

export const destroyNO = generalizedError;
export const updateNO = generalizedError;
