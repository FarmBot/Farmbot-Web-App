import axios from "axios";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";

export let maybeRefreshToken = (old: AuthState) => axios
  .get(API.current.tokensPath)
  .then(x => x.data, () => (old));
