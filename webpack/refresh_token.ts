import axios from "axios";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";
import { HttpData } from "./util";

export let maybeRefreshToken = (old: AuthState): Promise<AuthState> => {
  return axios
    .get(API.current.tokensPath)
    .then((x: HttpData<AuthState>) => x.data, () => (old));
};
