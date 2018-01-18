import {
  generateRefreshTrigger
} from "../connectivity/generate_refresh_trigger";
import { maybeGetDevice } from "../device";
import { get } from "lodash";
import { Edge } from "../connectivity/interfaces";
import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Actions } from "../constants";
import { Everything } from "../interfaces";

const maybePingBot = generateRefreshTrigger();
const expectation: Edge = "bot.mqtt";
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const device = maybeGetDevice();
    const action_type = action.type;
    const x = get(action, "payload.name", "?");
    const s: Everything = store.getState() as any;
    const botMqtt = s.bot.connectivity["bot.mqtt"];
    const { sync_status } = s.bot.hardware.informational_settings;
    const statusDidChange = (action_type === Actions.NETWORK_EDGE_CHANGE
      && x === expectation);
    const stillNeedState = (botMqtt && botMqtt.state === "up") && !sync_status;

    if (stillNeedState) {
      console.log("Were online and dont have a sync status. Let's ping.");
    }

    if (device && (statusDidChange || stillNeedState)) {
      maybePingBot(device, s);
    }
    return next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig = {
  env: "*",
  fn: stateFetchMiddleware
};
