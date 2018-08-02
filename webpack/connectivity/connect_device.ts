import { fetchNewDevice, getDevice } from "../device";
import { dispatchNetworkUp, dispatchNetworkDown } from "./index";
import { Log } from "farmbot/dist/resources/api_resources";
import { Farmbot, BotStateTree, TaggedResource, SpecialStatus } from "farmbot";
import { noop, throttle } from "lodash";
import { success, error, info, warning } from "farmbot-toastr";
import { HardwareState } from "../devices/interfaces";
import { GetState, ReduxAction } from "../redux/interfaces";
import { Content, Actions } from "../constants";
import { t } from "i18next";
import {
  EXPECTED_MAJOR,
  EXPECTED_MINOR,
  commandOK,
  badVersion,
  commandErr
} from "../devices/actions";
import { init } from "../api/crud";
import { AuthState } from "../auth/interfaces";
import { autoSync } from "./auto_sync";
import { startPinging } from "./ping_mqtt";
import { talk } from "browser-speech";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { versionOK } from "../util";
import { onLogs } from "./log_handlers";
import { ChannelName } from "../sequences/interfaces";

export const TITLE = "New message from bot";
/** TODO: This ought to be stored in Redux. It is here because of historical
 * reasons. Feel free to factor out when time allows. -RC, 10 OCT 17 */
export const HACKY_FLAGS = {
  needVersionCheck: true,
  alreadyToldUserAboutMalformedMsg: false
};

/** Action creator that is called when FarmBot OS emits a status update.
 * Coordinate updates, movement, etc.*/
export let incomingStatus = (statusMessage: HardwareState) =>
  ({ type: Actions.BOT_CHANGE, payload: statusMessage });

/** Determine if an incoming log has a certain channel. If it is, execute the
 * supplied callback. */
export function actOnChannelName(
  log: Log, channelName: ChannelName, cb: (log: Log) => void) {
  const CHANNELS: keyof Log = "channels";
  const chanList: ChannelName[] = log[CHANNELS] || ["ERROR FETCHING CHANNELS"];
  return log && (chanList.includes(channelName) ? cb(log) : noop());
}

/** Take a log message (of type toast) and determines the correct kind of toast
 * to execute. */
export function showLogOnScreen(log: Log) {
  switch (log.type) {
    case "success":
      return success(log.message, t(TITLE));
    case "warn":
      return warning(log.message, t(TITLE));
    case "busy":
    case "error":
      return error(log.message, t(TITLE));
    case "fun":
    case "info":
    default:
      return info(log.message, t(TITLE));
  }
}

export function speakLogAloud(getState: GetState) {
  return (log: Log) => {
    const getConfigValue = getWebAppConfigValue(getState);
    const speak = getConfigValue(BooleanSetting.enable_browser_speak);
    if (speak) {
      talk(log.message, navigator.language.slice(0, 2) || "en");
    }
  };
}

export const initLog = (log: Log): ReduxAction<TaggedResource> => init({
  kind: "Log",
  specialStatus: SpecialStatus.SAVED,
  uuid: "MUST_CHANGE",
  body: log
}, true);

export const batchInitResources =
  (payload: TaggedResource[]): ReduxAction<TaggedResource[]> => {
    return { type: Actions.BATCH_INIT, payload };
  };

export const bothUp = (why: string) => {
  dispatchNetworkUp("user.mqtt", undefined, why);
  dispatchNetworkUp("bot.mqtt", undefined, why);
};

export function readStatus() {
  const noun = "'Read Status' command";
  return getDevice()
    .readStatus()
    .then(() => { commandOK(noun); }, commandErr(noun));
}

export const onOffline = () => {
  dispatchNetworkDown("user.mqtt", undefined, "onOffline() callback");
  error(t(Content.MQTT_DISCONNECTED), t("Error"));
};

export const changeLastClientConnected = (bot: Farmbot) => () => {
  bot.setUserEnv({
    "LAST_CLIENT_CONNECTED": JSON.stringify(new Date())
  }).catch(() => { }); // This is internal stuff, don't alert user.
};
const onStatus = (dispatch: Function, getState: GetState) =>
  (throttle(function (msg: BotStateTree) {
    bothUp("Got a status message");
    dispatch(incomingStatus(msg));
    if (HACKY_FLAGS.needVersionCheck) {
      const IS_OK = versionOK(getState()
        .bot
        .hardware
        .informational_settings
        .controller_version, EXPECTED_MAJOR, EXPECTED_MINOR);
      if (!IS_OK) { badVersion(); }
      HACKY_FLAGS.needVersionCheck = false;
    }
  }, 600, { leading: false, trailing: true }));

type Client = { connected?: boolean };

export const onSent = (client: Client) => () => {
  const connected = !!client.connected;
  const why = `Outbound mqtt.js. client.connected = ${connected}`;
  const cb = connected ? dispatchNetworkUp : dispatchNetworkDown;
  cb("user.mqtt", undefined, why);
};

export function onMalformed() {
  bothUp("Got a malformed message");
  if (!HACKY_FLAGS.alreadyToldUserAboutMalformedMsg) {
    warning(t(Content.MALFORMED_MESSAGE_REC_UPGRADE));
    HACKY_FLAGS.alreadyToldUserAboutMalformedMsg = true;
  }
}

export const onOnline =
  () => dispatchNetworkUp("user.mqtt", undefined, "MQTT.js is online");
export const onReconnect =
  () => warning(t("Attempting to reconnect to the message broker"), t("Offline"));
const attachEventListeners =
  (bot: Farmbot, dispatch: Function, getState: GetState) => {
    if (bot.client) {
      startPinging(bot);
      readStatus().then(changeLastClientConnected(bot), noop);
      bot.on("online", onOnline);
      bot.on("online", () => bot.readStatus().then(noop, noop));
      bot.on("offline", onOffline);
      bot.on("sent", onSent(bot.client));
      bot.on("logs", onLogs(dispatch, getState));
      bot.on("status", onStatus(dispatch, getState));
      bot.on("malformed", onMalformed);
      bot.client.on("message", autoSync(dispatch, getState));
      bot.client.on("reconnect", onReconnect);
    }
  };

/** Connect to MQTT and attach all relevant event handlers. */
export let connectDevice = (token: AuthState) =>
  (dispatch: Function, getState: GetState) => fetchNewDevice(token)
    .then(bot => attachEventListeners(bot, dispatch, getState), onOffline);
