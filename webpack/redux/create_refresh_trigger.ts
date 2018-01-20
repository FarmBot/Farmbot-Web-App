import { NetworkState, ConnectionStatus } from "../connectivity/interfaces";
import { maybeGetDevice } from "../device";
import { changeLastClientConnected } from "../connectivity/connect_device";

/** Returns a stateful function that, when passed a ConnectionStatus object,
 * will trigger a bot state tree refresh.
 *
 * Most commonly seen when your internet connection comes back online and we
 * need to determine state changes since last connect.
 */
export function createRefreshTrigger() {
  const that = { lastStatus: (undefined as NetworkState | undefined) };
  return (status: ConnectionStatus | undefined) => {
    // If status is `undefined` it's too soon in the app lifecycle to call
    // a refresh
    if (status) {
      const { state } = status;
      const isUp = state === "up";
      const wasDown = that.lastStatus === "down";
      const device = maybeGetDevice();
      that.lastStatus = state;
      if (device && isUp && wasDown) {
        changeLastClientConnected(device)();
      }
    }
  };
}
