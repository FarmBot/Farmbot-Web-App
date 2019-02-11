import { UnsafeError } from "./interfaces";
import { error } from "farmbot-toastr";
import { prettyPrintApiErrors } from "./util";

export function toastErrors({ err }: UnsafeError) {
  return error(prettyPrintApiErrors(err));
}
