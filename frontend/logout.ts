import axios from "axios";
import { noop } from "lodash";
import { API } from "./api";
import { Session } from "./session";

export const logout = () => {
  axios.delete(API.current.tokensPath).then(noop, noop);
  Session.clear();
};
