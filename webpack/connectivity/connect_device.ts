import { fetchNewDevice, getDevice } from "../device";
import { dispatchNetworkUp, dispatchNetworkDown } from "./index";
import { Log } from "../interfaces";
import { ALLOWED_CHANNEL_NAMES, Farmbot, BotStateTree } from "farmbot";
import { throttle, noop } from "lodash";
import { success, error, info, warning } from "farmbot-toastr";
import { HardwareState } from "../devices/interfaces";
import { GetState, ReduxAction } from "../redux/interfaces";
import { Content, Actions } from "../constants";
import { t } from "i18next";
import {
  isLog,
  EXPECTED_MAJOR,
  EXPECTED_MINOR,
  commandOK,
  badVersion
} from "../devices/actions";
import { init } from "../api/crud";
import { AuthState } from "../auth/interfaces";
import { TaggedResource, SpecialStatus } from "../resources/tagged_resources";
import { autoSync } from "./auto_sync";
import { startPinging } from "./ping_mqtt";
import { talk } from "browser-speech";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { versionOK } from "../util";
import * as _ from "lodash";

export const TITLE = "New message from bot";
const THROTTLE_MS = 600;
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
  log: Log, channelName: ALLOWED_CHANNEL_NAMES, cb: (log: Log) => void) {
  const CHANNELS: keyof Log = "channels";
  const chanList: string[] = log[CHANNELS] || ["ERROR FETCHING CHANNELS"];
  return log && (chanList.includes(channelName) ? cb(log) : noop());
}

/** Take a log message (of type toast) and determines the correct kind of toast
 * to execute. */
export function showLogOnScreen(log: Log) {
  switch (log.type) {
    case "success":
      return success(log.message, TITLE);
    case "busy":
    case "warn":
    case "error":
      return error(log.message, TITLE);
    case "fun":
    case "info":
    default:
      return info(log.message, TITLE);
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

export const bothUp = () => {
  dispatchNetworkUp("user.mqtt");
  dispatchNetworkUp("bot.mqtt");
};

export function readStatus() {
  const noun = "'Read Status' command";
  return getDevice()
    .readStatus()
    .then(() => { commandOK(noun); }, () => { });
}

export const onOffline = () => {
  dispatchNetworkDown("user.mqtt");
  error(t(Content.MQTT_DISCONNECTED));
};

export const changeLastClientConnected = (bot: Farmbot) => () => {
  bot.setUserEnv({
    "LAST_CLIENT_CONNECTED": JSON.stringify(new Date())
  }).catch(() => { });
};

const onStatus = (dispatch: Function, getState: GetState) =>
  (throttle(function (msg: BotStateTree) {
    bothUp();
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
  }, THROTTLE_MS));

type Client = { connected?: boolean };

export const onSent = (client: Client) => () => !!client.connected ?
  dispatchNetworkUp("user.mqtt") : dispatchNetworkDown("user.mqtt");

const LEGACY_META_KEY_NAMES: (keyof Log)[] = [
  "type",
  "x",
  "y",
  "z",
  "verbosity",
  "major_version",
  "minor_version"
];

function legacyKeyTransformation(log: Log, key: keyof Log) {
  log[key] = log[key] || _.get(log, ["meta", key], undefined);
}

export const onLogs = (dispatch: Function, getState: GetState) => throttle((msg: Log) => {
  bothUp();
  if (isLog(msg)) {
    LEGACY_META_KEY_NAMES.map(key => legacyKeyTransformation(msg, key));
    actOnChannelName(msg, "toast", showLogOnScreen);
    actOnChannelName(msg, "espeak", speakLogAloud(getState));
    dispatch(initLog(msg));
    // CORRECT SOLUTION: Give each device its own topic for publishing
    //                   MQTT last will message.
    // FAST SOLUTION:    We would need to re-publish FBJS and FBOS to
    //                   change topic structure. Instead, we will use
    //                   inband signalling (for now).
    // TODO:             Make a `bot/device_123/offline` channel.
    const died =
      msg.message.includes("is offline") && msg.type === "error";
    died && dispatchNetworkDown("bot.mqtt");
  }
}, THROTTLE_MS);

export function onMalformed() {
  bothUp();
  if (!HACKY_FLAGS.alreadyToldUserAboutMalformedMsg) {
    warning(t(Content.MALFORMED_MESSAGE_REC_UPGRADE));
    HACKY_FLAGS.alreadyToldUserAboutMalformedMsg = true;
  }
}

export const onOnline = () => dispatchNetworkUp("user.mqtt");
export const onReconnect =
  () => warning(t("Attempting to reconnect to the message broker"), t("Offline"));
const attachEventListeners =
  (bot: Farmbot, dispatch: Function, getState: GetState) => {
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
  };

/** Connect to MQTT and attach all relevant event handlers. */
export let connectDevice = (token: AuthState) =>
  (dispatch: Function, getState: GetState) => fetchNewDevice(token)
    .then(bot => attachEventListeners(bot, dispatch, getState), onOffline);
