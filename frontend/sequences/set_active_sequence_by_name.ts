import { selectAllSequences } from "../resources/selectors";
import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { selectSequence } from "./actions";
import { setMenuOpen } from "./test_button";
import { Path } from "../internal_urls";

const setSequence = (uuid: string) => store.dispatch(selectSequence(uuid));

export function setActiveSequenceByName() {
  const chunk = Path.getLastChunk();
  store.dispatch(setMenuOpen(undefined));
  if (!chunk || chunk == "sequences") {
    return;
  }

  selectAllSequences(store.getState().resources.index).map(seq => {
    const sequenceName = urlFriendly(seq.body.name);
    (chunk === sequenceName) && setSequence(seq.uuid);
  });
}
