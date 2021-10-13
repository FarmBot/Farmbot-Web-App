import { UnsafeError } from "./interfaces";
import { AxiosErrorResponse, prettyPrintApiErrors } from "./util";
import { error } from "./toast/toast";

export function toastErrors({ err }: UnsafeError) {
  return error(prettyPrintApiErrors(err as AxiosErrorResponse));
}
