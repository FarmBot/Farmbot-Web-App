import { Farmbot, uuid } from "farmbot";
import {
  dispatchQosStart,
  pingOK,
  pingNO,
} from "./index";
import { now } from "../devices/connectivity/qos";

export const PING_INTERVAL = 2000;
/**
 * Time to wait in milliseconds after sending a ping to manually fail it
 * if bot.ping() doesn't resolve or reject. Setting this value lower than
 * bot.ping()'s 10 second default promise timeout will shortcut that timeout.
 * This value will also limit the network quality "worst ping" time.
 */
const PING_TIMEOUT = 5500;

export function sendOutboundPing(bot: Farmbot) {
  return new Promise((resolve, reject) => {
    const id = uuid();

    const x = { done: false };

    const ok = () => {
      if (!x.done) {
        x.done = true;
        pingOK(id, now());
        resolve("");
      }
    };

    const no = () => {
      if (!x.done) {
        x.done = true;
        pingNO(id, now());
        reject(new Error("sendOutboundPing failed: " + id));
      }
    };

    dispatchQosStart(id);
    setTimeout(no, PING_TIMEOUT);
    bot.ping().then(ok, no);
  });
}

const beep = (bot: Farmbot) => sendOutboundPing(bot)
  .then(() => { }, () => { }); // Silence errors;

export function startPinging(bot: Farmbot) {
  beep(bot);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setInterval(() => beep(bot), PING_INTERVAL);
}
