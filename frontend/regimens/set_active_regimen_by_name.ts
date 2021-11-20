import { selectAllRegimens } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectRegimen } from "./actions";

const setRegimen = (uuid: string) => store.dispatch(selectRegimen(uuid));

export function setActiveRegimenByName() {
  const chunk = lastUrlChunk();
  if (!chunk || chunk == "regimens") {
    return;
  }

  selectAllRegimens(store.getState().resources.index).map(reg => {
    const regimenName = urlFriendly(reg.body.name);
    (chunk === regimenName) && setRegimen(reg.uuid);
  });
}
