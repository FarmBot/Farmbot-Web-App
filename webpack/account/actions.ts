import axios from "axios";
import { Thunk } from "../redux/interfaces";
import { API } from "../api";
import { DeletionRequest } from "./interfaces";
import { toastErrors, HttpData } from "../util";
import { Session } from "../session";

export function deleteUser(payload: DeletionRequest): Thunk {
  return (dispatch, getState) => {
    let state = getState().auth;
    if (state) {
      axios({
        method: "delete",
        url: API.current.usersPath,
        data: payload,
        params: { force: true }
      })
        .then((resp: HttpData<{}>) => {
          alert("We're sorry to see you go. :(");
          Session.clear(true);
        })
        .catch(toastErrors);
    } else {
      throw new Error("Impossible");
    }
  };
}
