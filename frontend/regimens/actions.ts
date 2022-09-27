import { SelectRegimen } from "./editor/interfaces";
import { Actions } from "../constants";

export function selectRegimen(payload: string): SelectRegimen {
  if (payload.startsWith("Regimen")) {
    return { type: Actions.SELECT_REGIMEN, payload };
  } else {
    throw new Error("Not a regimen.");
  }
}
