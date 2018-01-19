import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Everything } from "../interfaces";
import { NetworkState, ConnectionStatus } from "../connectivity/interfaces";
import { maybeGetDevice } from "../device";
import { changeLastClientConnected } from "../connectivity/connect_device";

let lastStatus: NetworkState | undefined;

function maybeRefresh(status: ConnectionStatus | undefined) {
  // If status is `undefined` it's too soon in the app lifecycle to call
  // a refresh
  if (status) {
    const { state } = status;
    const isUp = state === "up";
    const wasDown = lastStatus === "down";
    const device = maybeGetDevice();
    if (device && isUp && wasDown) {
      console.log("Back online!");
      changeLastClientConnected(device)();
    }
    lastStatus = state;
  }
}

const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const s: Everything = store.getState() as any;
    maybeRefresh(s.bot.connectivity["bot.mqtt"]);
    next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig =
  ({ env: "*", fn: stateFetchMiddleware });
