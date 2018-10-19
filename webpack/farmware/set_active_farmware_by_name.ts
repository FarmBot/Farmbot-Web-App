import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { Actions } from "../constants";

export function setActiveFarmwareByName(farmwareNames: (string | undefined)[]) {
  const chunk = urlFriendly(lastUrlChunk());
  if (chunk == "farmware") { return; }

  farmwareNames.map(payload => {
    if (payload) {
      const urlName = urlFriendly(payload);
      const match = chunk === urlName;
      match && store.dispatch({ type: Actions.SELECT_FARMWARE, payload });
    }
  });
}
