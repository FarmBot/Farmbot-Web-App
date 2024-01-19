import { selectAllRegimens } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { selectRegimen } from "./actions";
import { Path } from "../internal_urls";
import { UnknownAction } from "redux";

const setRegimen = (uuid: string) =>
  store.dispatch(selectRegimen(uuid) as unknown as UnknownAction);

export function setActiveRegimenByName() {
  const chunk = Path.getLastChunk();
  if (!chunk || chunk == "regimens") {
    return;
  }

  selectAllRegimens(store.getState().resources.index).map(reg => {
    const regimenName = urlFriendly(reg.body.name);
    (chunk === regimenName) && setRegimen(reg.uuid);
  });
}
