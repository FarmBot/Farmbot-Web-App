import { Regimen } from "./interfaces";
import { edit } from "../api/crud";
import { TaggedRegimen, isTaggedRegimen } from "../resources/tagged_resources";
import { SelectRegimen } from "./editor/interfaces";
import { Actions } from "../constants";

export function editRegimen(r: TaggedRegimen | undefined,
  update: Partial<Regimen>) {
  return (dispatch: Function) => {
    r && isTaggedRegimen(r) && dispatch(edit(r, update));
  };
}

export function selectRegimen(payload: string): SelectRegimen {
  if (payload.startsWith("Regimen")) {
    return { type: Actions.SELECT_REGIMEN, payload };
  } else {
    throw new Error("Not a regimen.");
  }
}
