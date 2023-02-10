import { selectAllRegimens } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { selectRegimen } from "./actions";
import { Path } from "../internal_urls";

const setRegimen = (uuid: string) => store.dispatch(selectRegimen(uuid));

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
