import * as selectors from "../resources/selectors";
import * as reduxStore from "../redux/store";
import { urlFriendly } from "../util";
import * as sequenceActions from "./actions";
import * as testButton from "./test_button";
import { Path } from "../internal_urls";
import { UnknownAction } from "redux";

const setSequence = (uuid: string) =>
  reduxStore.store.dispatch(
    sequenceActions.selectSequence(uuid) as unknown as UnknownAction);

export function setActiveSequenceByName() {
  const chunk = Path.getLastChunk();
  reduxStore.store.dispatch(
    testButton.setMenuOpen({ component: undefined, uuid: undefined }));
  if (!chunk || chunk == "sequences") {
    return;
  }

  selectors.selectAllSequences(reduxStore.store.getState().resources.index).map(seq => {
    const sequenceName = urlFriendly(seq.body.name);
    (chunk === sequenceName) && setSequence(seq.uuid);
  });
}
