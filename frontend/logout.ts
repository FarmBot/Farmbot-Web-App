import axios from "axios";
import { noop } from "lodash";
import { API } from "./api";
import { Session } from "./session";

export const logout = (keepToken = false) => () => {
  !keepToken && axios.delete(API.current.tokensPath).then(noop, noop);
  Session.clear();
};
