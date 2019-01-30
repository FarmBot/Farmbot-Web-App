import { Actions } from "../../constants";

export function selectImage(uuid: string | undefined) {
  return { type: Actions.SELECT_IMAGE, payload: uuid };
}
