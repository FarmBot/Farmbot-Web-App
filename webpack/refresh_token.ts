import axios from "axios";
import { API } from "./api/index";
import { HttpData } from "./util";
import { AuthState } from "./auth/interfaces";

export let maybeRefreshToken = (old: AuthState) => axios
  .get(API.current.tokensPath)
  .then(x => x.data, () => (old));
