import axios from "axios";
import { API } from "./api/index";
import { HttpData } from "./util";
import { Token } from "./auth/interfaces";

export function maybeRefreshToken(old: Token) {
  const no = () => {
    console.log("Can't DL new token. Here's the old one:");
    return old;
  };

  const ok = (resp: HttpData<Token>) => {
    console.log("Here's a fresh token");
    return resp.data;
  };

  return axios.get(API.current.tokensPath).then(ok, no);
}
