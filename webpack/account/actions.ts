import axios from "axios";
import { Thunk } from "../redux/interfaces";
import { API } from "../api";
import { DeletionRequest } from "./interfaces";
import { Session } from "../session";
import { UnsafeError } from "../interfaces";
import { toastErrors } from "../toast_errors";

export function deleteUser(payload: DeletionRequest): Thunk {
  return (dispatch, getState) => {
    const state = getState().auth;
    if (state) {
      axios({
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
    } else {
      throw new Error("Impossible");
    }
  };
}
