import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectSequence } from "./actions";
import { setMenuOpen } from "./test_button";

const setSequence = (uuid: string) => store.dispatch(selectSequence(uuid));

export function setActiveSequenceByName() {
  store.dispatch(setMenuOpen(false));
  if (lastUrlChunk() == "sequences") {
    return;
  }

  selectAllSequences(store.getState().resources.index).map(seq => {
    const name = urlFriendly(seq.body.name);
    (lastUrlChunk() === name) && setSequence(seq.uuid);
  });
}
