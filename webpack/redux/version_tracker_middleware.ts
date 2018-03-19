import { Middleware } from "redux";
import { EnvName } from "./interfaces";

const fn: Middleware = () => (dispatch) => (action: any) => dispatch(action);

const env: EnvName = "*";

export const versionChangeMiddleware = { env, fn };
