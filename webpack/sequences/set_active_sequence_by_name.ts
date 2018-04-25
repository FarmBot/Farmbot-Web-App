import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { selectSequence } from "./actions";
import { push } from "../history";

export function setActiveSequenceByName() {
  console.log("Hmmm");
  if (lastUrlChunk() == "sequences") { return; }
  selectAllSequences(store.getState().resources.index).map(seq => {
    const name = urlFriendly(seq.body.name);
    const setSequence = () => store.dispatch(selectSequence(seq.uuid));
    if (lastUrlChunk() === name) {
      push(`api/sequences/${name}`);
      setTimeout(setSequence, 450);
    }
  });
}
