import { devices } from "../device";
import { dispatchNetworkUp, dispatchNetworkDown } from "./index";
import { Log } from "../interfaces";
import { ALLOWED_CHANNEL_NAMES, ALLOWED_MESSAGE_TYPES, Farmbot, BotStateTree } from "farmbot";
import { get, set, throttle, noop } from "lodash";
import { success, error, info, warning } from "farmbot-toastr";
import { HardwareState } from "../devices/interfaces";
import { GetState } from "../redux/interfaces";
import { maybeRefreshToken } from "../refresh_token";
import { Content, Actions } from "../constants";
import { t } from "i18next";
import { isLog, EXPECTED_MAJOR, EXPECTED_MINOR, commandOK, badVersion } from "../devices/actions";
import { oneOf, bail } from "../util";
import { init } from "../api/crud";
import { versionOK } from "../devices/reducer";
import { Token } from "../auth/interfaces";
/** Welcome to one of the oldest pieces of FarmBot's software stack. */
const AUTH_NOT_READY = "Somehow managed to get here before auth was ready.";
const CHANNELS: keyof Log = "channels";
const TOAST: ALLOWED_CHANNEL_NAMES = "toast";
const TITLE = "New message from bot";
let NEED_VERSION_CHECK = true;
// Already filtering messages in FarmBot OS and the API- this is just for
// an additional layer of safety. If sensitive data ever hits a client, it will
// be reported to Rollbar for investigation.
type ConnectDeviceReturn = {} | ((dispatch: Function) => void);
const BAD_WORDS = ["WPA", "PSK", "PASSWORD", "NERVES"];
let alreadyToldYou = false;
const mq = "user.mqtt";

function incomingStatus(statusMessage: HardwareState) {
  return { type: Actions.BOT_CHANGE, payload: statusMessage };
}

function ifToast(log: Log, cb: (m: ALLOWED_MESSAGE_TYPES) => void) {
  const chanList = get(log, CHANNELS, ["ERROR FETCHING CHANNELS"]);
  return chanList.includes(TOAST) ?
    cb(log.meta.type as ALLOWED_MESSAGE_TYPES) : noop();
}

function maybeShowLog(log: Log) {
  ifToast(log, (m) => {
    switch (m) {
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
  });
}

const bothUp = () => {
  dispatchNetworkUp("user.mqtt");
  dispatchNetworkUp("bot.mqtt");
};

function readStatus() {
  const noun = "'Read Status' command";
  return devices
    .current
    .readStatus()
    .then(() => { commandOK(noun); }, () => { });
}

export function connectDevice(oldToken: string): ConnectDeviceReturn {
  return (dispatch: Function, getState: GetState) => {
    const ath = getState().auth;
    const ok = doConnect(dispatch, getState);

    ath ? (maybeRefreshToken(ath).then(ok)) : bail(AUTH_NOT_READY);
  };
}

const onOffline = () => {
  dispatchNetworkDown("user.mqtt");
  error(t(Content.MQTT_DISCONNECTED));
};

const doConnect = (dispatch: Function, getState: GetState) =>
  ({
   token }: { token: Token }) => {
    const secure = location.protocol === "https:";
    const bot = new Farmbot({ token: token.encoded, secure });
    bot.on("online", onOnline);
    bot.on("offline", onOffline);
    return bot
      .connect()
      .then(bootstrapAllTheThings(bot, dispatch, getState), noop);
  };

function onMalformed() {
  bothUp();
  if (!alreadyToldYou) {
    warning(t(Content.MALFORMED_MESSAGE_REC_UPGRADE));
    alreadyToldYou = true;
  }
}

const onLogs = (dispatch: Function) => (msg: Log) => {
  bothUp();
  if (isLog(msg) && !oneOf(BAD_WORDS, msg.message.toUpperCase())) {
    maybeShowLog(msg);
    dispatch(init({
      kind: "logs",
      specialStatus: undefined,
      uuid: "MUST_CHANGE",
      body: msg
    }));
    // CORRECT SOLUTION: Give each device its own topic for publishing
    //                   MQTT last will message.
    // FAST SOLUTION:    We would need to re-publish FBJS and FBOS to
    //                   change topic structure. Instead, we will use
    //                   inband signalling (for now).
    // TODO:             Make a `bot/device_123/offline` channel.
    const died =
      msg.message.includes("is offline") && msg.meta.type === "error";
    died && dispatchNetworkDown("bot.mqtt");
  } else {
    throw new Error("Refusing to display log: " + JSON.stringify(msg));
  }
};

const onSent = (/** The MQTT Client Object (bot.client) */ client: {}) =>
  (any: {}) => {
    const netState = (get(client, "connected", false));
    netState ? dispatchNetworkUp(mq) : dispatchNetworkDown(mq);
  };

const onStatus = (dispatch: Function, getState: GetState) =>
  (throttle(function (msg: BotStateTree) {
    bothUp();
    dispatch(incomingStatus(msg));
    if (NEED_VERSION_CHECK) {
      const IS_OK = versionOK(getState()
        .bot
        .hardware
        .informational_settings
        .controller_version, EXPECTED_MAJOR, EXPECTED_MINOR);
      if (!IS_OK) { badVersion(); }
      NEED_VERSION_CHECK = false;
    }
  }, 500));

const onOnline = () => dispatchNetworkUp("user.mqtt");

const changeLastClientConnected = (bot: Farmbot) => () => {
  bot.setUserEnv({
    "LAST_CLIENT_CONNECTED": JSON.stringify(new Date())
  });
};

const bootstrapAllTheThings =
  (bot: Farmbot, dispatch: Function, getState: GetState) => () => {
    devices.online = true;
    devices.current = bot;
    bot.on("sent", onSent(bot.client));
    bot.on("logs", onLogs(dispatch));
    bot.on("status", onStatus(dispatch, getState));
    bot.on("malformed", onMalformed);
    readStatus().then(changeLastClientConnected(bot), noop);
    set(window, "current_bot", bot);
  };
