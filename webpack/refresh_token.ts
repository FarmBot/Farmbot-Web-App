import axios from "axios";
import { API } from "./api/index";
import { HttpData } from "./util";
import { AuthState } from "./auth/interfaces";

export function maybeRefreshToken(old: AuthState) {

  const no = () => {
    console.log("Can't DL new token. Here's the old one:");
    return old;
  };

  const ok = (resp: HttpData<AuthState>) => {
    console.log("Here's a fresh token");
    return resp.data;
  };

  return axios.get(API.current.tokensPath).then(ok, no);
}
