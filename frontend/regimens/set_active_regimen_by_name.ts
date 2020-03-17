import { selectAllRegimens } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectRegimen } from "./actions";

const setRegimen = (uuid: string) => store.dispatch(selectRegimen(uuid));

export function setActiveRegimenByName() {
  if (lastUrlChunk() == "regimens") {
    return;
  }

  selectAllRegimens(store.getState().resources.index).map(reg => {
    const regimenName = urlFriendly(reg.body.name);
    (lastUrlChunk() === regimenName) && setRegimen(reg.uuid);
  });
}
