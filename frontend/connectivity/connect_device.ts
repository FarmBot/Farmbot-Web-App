import { fetchNewDevice } from "../device";
import { dispatchNetworkUp, dispatchNetworkDown } from "./index";
import { Log } from "farmbot/dist/resources/api_resources";
import { Farmbot, BotStateTree, TaggedResource } from "farmbot";
import { FbjsEventName } from "farmbot/dist/constants";
import { noop } from "lodash";
import {
  success, error, info, warning, fun, busy, removeToast,
} from "../toast/toast";
import { HardwareState } from "../devices/interfaces";
import { GetState, ReduxAction } from "../redux/interfaces";
import { Content, Actions } from "../constants";
import { badVersion, readStatusReturnPromise } from "../devices/actions";
import { init } from "../api/crud";
import { AuthState } from "../auth/interfaces";
import { autoSync } from "./auto_sync";
import { startPinging } from "./ping_mqtt";
import { talk } from "browser-speech";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { beep, versionOK } from "../util";
import { onLogs } from "./log_handlers";
import { ChannelName, MessageType } from "../sequences/interfaces";
import { slowDown } from "./slow_down";
import { t } from "../i18next_wrapper";
import { now } from "../devices/connectivity/qos";
import { forceOnline } from "../devices/must_be_online";

export const TITLE = () => t("New message from bot");

/** Action creator that is called when FarmBot OS emits a status update.
 * Coordinate updates, movement, etc.*/
export const incomingStatus = (statusMessage: HardwareState) =>
  ({ type: Actions.STATUS_UPDATE, payload: statusMessage });

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
  const toast = () => {
    switch (log.type) {
      case MessageType.success:
        return success;
      case MessageType.warn:
        return warning;
      case MessageType.error:
        return error;
      case MessageType.fun:
        return fun;
      case MessageType.busy:
        return busy;
      case MessageType.debug:
        return (msg: string, title: string) => info(msg, { title, color: "gray" });
      case MessageType.info:
      default:
        return info;
    }
  };
  toast()(log.message, TITLE());
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

export function logBeep(getState: GetState) {
  return (log: Log) => {
    const getConfigValue = getWebAppConfigValue(getState);
    const beepVerbosity = getConfigValue(NumericSetting.beep_verbosity);
    if (beepVerbosity && (log.verbosity || 1) <= +beepVerbosity) {
      beep(log.type);
    }
  };
}

export const initLog =
  (log: Log): ReduxAction<TaggedResource> => init("Log", log, true);

export const batchInitResources =
  (payload: TaggedResource[]): ReduxAction<TaggedResource[]> => {
    return { type: Actions.BATCH_INIT, payload };
  };

export const bothUp = () => dispatchNetworkUp("user.mqtt", now());

export const changeLastClientConnected = (bot: Farmbot) => () => {
  bot.setUserEnv({
    "LAST_CLIENT_CONNECTED": JSON.stringify(new Date())
  }).catch(noop); // This is internal stuff, don't alert user.
};
const setBothUp = () => bothUp();

const legacyChecks = (dispatch: Function, getState: GetState) => {
  const { controller_version } = getState().bot.hardware.informational_settings;
  const { needVersionCheck } = getState().bot;
  if (needVersionCheck && controller_version) {
    const IS_OK = versionOK(controller_version);
    if (!IS_OK) { badVersion(); }
    dispatch({ type: Actions.SET_NEEDS_VERSION_CHECK, payload: false });
  }
};

export const onStatus =
  (dispatch: Function, getState: GetState) =>
    slowDown((msg: BotStateTree) => {
      setBothUp();
      dispatch(incomingStatus(msg));
      legacyChecks(dispatch, getState);
    });

type Client = { connected?: boolean };

export const onSent = (client: Client) => () => {
  const connected = !!client.connected;
  const cb = connected ? dispatchNetworkUp : dispatchNetworkDown;
  cb("user.mqtt", now());
};

export const onMalformed = (dispatch: Function, getState: GetState) => () => {
  const { alreadyToldUserAboutMalformedMsg } = getState().bot;
  bothUp();
  if (!alreadyToldUserAboutMalformedMsg) {
    warning(t(Content.MALFORMED_MESSAGE_REC_UPGRADE));
    dispatch({ type: Actions.SET_MALFORMED_NOTIFICATION_SENT, payload: true });
  }
};

export const onOnline = () => {
  removeToast("offline");
  if (!forceOnline()) {
    success(t("Reconnected to the message broker."), { title: t("Online") });
  }
  dispatchNetworkUp("user.mqtt", now());
};

export const onReconnect = () => {
  if (!forceOnline()) {
    warning(t("Attempting to reconnect to the message broker"),
      { title: t("Offline"), color: "yellow", idPrefix: "offline" });
  }
};

export const onOffline = () => {
  dispatchNetworkDown("user.mqtt", now());
  if (!forceOnline()) {
    error(t(Content.MQTT_DISCONNECTED), { idPrefix: "offline" });
  }
};

export function onPublicBroadcast(payl: unknown) {
  console.log(FbjsEventName.publicBroadcast, payl);
  if (confirm(t(Content.FORCE_REFRESH_CONFIRM))) {
    location.assign(window.location.origin || "/");
  } else {
    alert(t(Content.FORCE_REFRESH_CANCEL_WARNING));
  }
}

export const attachEventListeners =
  (bot: Farmbot, dispatch: Function, getState: GetState) => {
    if (bot.client) {
      startPinging(bot);
      readStatusReturnPromise().then(changeLastClientConnected(bot), noop);
      bot.on(FbjsEventName.online, onOnline);
      bot.on(FbjsEventName.online, () => bot.readStatus().then(noop, noop));
      bot.on(FbjsEventName.offline, onOffline);
      bot.on(FbjsEventName.sent, onSent(bot.client));
      bot.on(FbjsEventName.logs, onLogs(dispatch, getState));
      bot.on(FbjsEventName.status, onStatus(dispatch, getState));
      bot.on(FbjsEventName.malformed, onMalformed(dispatch, getState));
      bot.client.subscribe(FbjsEventName.publicBroadcast);
      bot.on(FbjsEventName.publicBroadcast, onPublicBroadcast);
      bot.client.on("message", autoSync(dispatch, getState));
      bot.client.on("reconnect", onReconnect);
    }
  };

/** Connect to MQTT and attach all relevant event handlers. */
export const connectDevice = (token: AuthState) =>
  (dispatch: Function, getState: GetState) => fetchNewDevice(token)
    .then(bot => attachEventListeners(bot, dispatch, getState), onOffline);
