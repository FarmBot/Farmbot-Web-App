import { store } from "../redux/store";
import { lastUrlChunk } from "../util";
import { Actions } from "../constants";
import { farmwareUrlFriendly } from "./index";

export function setActiveFarmwareByName(farmwareNames: (string | undefined)[]) {
  const chunk = farmwareUrlFriendly(lastUrlChunk());
  if (chunk == "farmware") { return; }

  farmwareNames.map(payload => {
    if (payload) {
      const urlName = farmwareUrlFriendly(payload);
      const directMatch = chunk === urlName;
      const altMatch = chunk === "weed_detector" && urlName === "plant_detection";
      const match = directMatch || altMatch;
      match && store.dispatch({ type: Actions.SELECT_FARMWARE, payload });
    }
  });
}
