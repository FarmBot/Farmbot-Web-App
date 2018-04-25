import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { selectSequence } from "./actions";

export function setActiveSequenceByName(name = "") {
  const sequences = selectAllSequences(store.getState().resources.index);

  sequences.map(seq => {
    const isMatch = (urlFriendly(name) === urlFriendly(seq.body.name));
    debugger;
    isMatch && console.log("FOUND A MATCH!");
    isMatch && store.dispatch(selectSequence(seq.uuid));
  });
}
