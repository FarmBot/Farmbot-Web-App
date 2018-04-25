import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectSequence } from "./actions";

export function setActiveSequenceByName(_ = "") {

  if (lastUrlChunk() == "sequences") {
    return;
  }

  selectAllSequences(store.getState().resources.index)
    .map(seq => {
      const name = urlFriendly(seq.body.name);
      const setSequence = () => store.dispatch(selectSequence(seq.uuid));
      (lastUrlChunk() === name) && setTimeout(setSequence, 0);
    });
}
