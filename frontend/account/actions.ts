import axios from "axios";
import { Thunk } from "../redux/interfaces";
import { API } from "../api";
import { DeletionRequest } from "./interfaces";
import { Session } from "../session";
import { UnsafeError } from "../interfaces";
import { toastErrors } from "../toast_errors";
import { t } from "../i18next_wrapper";

export function deleteUser(payload: DeletionRequest): Thunk {
  return (_, getState) => {
    const { auth } = getState();
    auth && axios({
      method: "delete",
      url: API.current.usersPath,
      data: payload,
      params: { force: true }
    })
      .then(() => {
        alert("We're sorry to see you go. :(");
        Session.clear();
      })
      .catch((err: UnsafeError) => {
        toastErrors({ err });
      });
  };
}

export const resetAccount = (payload: DeletionRequest): Thunk =>
  (_, getState) =>
    getState().auth && axios({
      method: "post",
      url: API.current.accountResetPath,
      data: payload,
    })
      .then(() => alert(t("Account has been reset.")))
      .catch((err: UnsafeError) => toastErrors({ err }));
