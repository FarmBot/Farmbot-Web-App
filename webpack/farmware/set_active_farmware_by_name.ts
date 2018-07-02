import { store } from "../redux/store";
import { urlFriendly, lastUrlChunk } from "../util";
import { Actions } from "../constants";

export function setActiveFarmwareByName(farmwareNames: (string | undefined)[]) {
  if (lastUrlChunk() == "farmware") {
    return;
  }

  farmwareNames.map(name => {
    if (name) {
      const urlName = urlFriendly(name);
      (lastUrlChunk() === urlName) && store.dispatch({
        type: Actions.SELECT_FARMWARE,
        payload: name
      });
    }
  });

}
