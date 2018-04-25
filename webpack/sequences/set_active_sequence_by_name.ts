import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectSequence } from "./actions";

export function setActiveSequenceByName(_ = "") {
  const sequences =
    selectAllSequences(store.getState().resources.index);
  const chunk = lastUrlChunk();
  if (chunk == "sequences") {
    return;
  }
  sequences.map(seq => {
    const name = urlFriendly(seq.body.name);
    const isMatch = (chunk === name);
    if (isMatch) {
      console.log("FOUND A MATCH!");
      setTimeout(() => store.dispatch(selectSequence(seq.uuid)), 2000);
    }
  });
}
