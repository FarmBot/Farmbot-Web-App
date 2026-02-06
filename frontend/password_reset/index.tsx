import * as util from "../util";
import { PasswordReset } from "./password_reset";

export const initPasswordReset = () => util.entryPoint(PasswordReset);

initPasswordReset();
