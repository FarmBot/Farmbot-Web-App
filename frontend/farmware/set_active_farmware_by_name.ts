import { store } from "../redux/store";
import { urlFriendly } from "../util";
import { Actions } from "../constants";
import { Path } from "../internal_urls";

export const farmwareUrlFriendly = (farmwareName: string) =>
  urlFriendly(farmwareName).replace(/-/g, "_");

export function setActiveFarmwareByName(farmwareNames: (string | undefined)[]) {
  const chunk = farmwareUrlFriendly(Path.getLastChunk());
  if (!chunk || chunk == "farmware") { return; }

  farmwareNames.map(farmwareName => {
    if (farmwareName) {
      const urlName = farmwareUrlFriendly(farmwareName);
      const directMatch = chunk === urlName;
      const altMatch = chunk === "weed_detector" && urlName === "plant_detection";
      const match = directMatch || altMatch;
      match && store.dispatch({
        type: Actions.SELECT_FARMWARE,
        payload: farmwareName
      });
    }
  });
}
