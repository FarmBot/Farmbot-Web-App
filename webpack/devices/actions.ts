import { Farmbot } from "farmbot";
import { t } from "i18next";
import axios from "axios";
import * as _ from "lodash";
import { success, warning, info, error } from "farmbot-toastr";
import { devices } from "../device";
import { Log, Everything } from "../interfaces";
import { GithubRelease, MoveRelProps } from "./interfaces";
import { Thunk, GetState } from "../redux/interfaces";
import { BotState } from "../devices/interfaces";
import {
  McuParams,
  Configuration,
  BotStateTree,
  ALLOWED_CHANNEL_NAMES,
  ALLOWED_MESSAGE_TYPES,
  SyncStatus
} from "farmbot";
import { Sequence } from "../sequences/interfaces";
import { HardwareState, ControlPanelState } from "../devices/interfaces";
import { API } from "../api/index";
import { User } from "../auth/interfaces";
import { init } from "../api/crud";
import { getDeviceAccountSettings } from "../resources/selectors";
import { TaggedDevice } from "../resources/tagged_resources";
import { versionOK } from "./reducer";
import { oneOf, HttpData } from "../util";
import { Actions, Content } from "../constants";
import { mcuParamValidator } from "./update_interceptor";
import { dispatchNetworkUp, dispatchNetworkDown } from "../connectivity/index";

const ON = 1, OFF = 0;
export type ConfigKey = keyof McuParams;
export const EXPECTED_MAJOR = 5;
export const EXPECTED_MINOR = 0;

function incomingStatus(statusMessage: HardwareState) {
  return { type: "BOT_CHANGE", payload: statusMessage };
}

export function isLog(x: object): x is Log {
  return _.isObject(x) && _.isString(_.get(x, "message" as keyof Log));
}
const commandErr = (noun = "Command") => (x: {}) => {
  console.dir(x);
  console.info("Took longer than 6 seconds: " + noun);
};

const commandOK = (noun = "Command") => () => {
  const msg = noun + " request sent to device.";
  success(msg, t("Request sent"));
};

export function checkControllerUpdates() {
  const noun = "Check for Updates";
  devices
    .current
    .checkUpdates()
    .then(commandOK(noun), commandErr(noun));
}

export function powerOff() {
  const noun = "Power Off Bot";
  devices
    .current
    .powerOff()
    .then(commandOK(noun), commandErr(noun));
}

export function factoryReset() {
  if (!confirm(t(Content.FACTORY_RESET_ALERT))) {
    return;
  }
  devices
    .current
    .resetOS();
}

export function reboot() {
  const noun = "Reboot Bot";
  devices
    .current
    .reboot()
    .then(commandOK(noun), commandErr(noun));
}

export function emergencyLock() {
  const noun = "Emergency stop";
  devices
    .current
    .emergencyLock()
    .then(commandOK(noun), commandErr(noun));
}

export function emergencyUnlock() {
  const noun = "Emergency unlock";
  if (confirm(`Are you sure you want to unlock the device?`)) {
    devices
      .current
      .emergencyUnlock()
      .then(commandOK(noun), commandErr(noun));
  }
}

export function sync(): Thunk {
  const noun = "Sync";
  return function (dispatch, getState) {
    const IS_OK = versionOK(getState()
      .bot
      .hardware
      .informational_settings
      .controller_version, EXPECTED_MAJOR, EXPECTED_MINOR);
    if (IS_OK) {
      dispatch(setSyncStatus("syncing"));
      devices
        .current
        .sync()
        .then(() => {
          commandOK(noun);
          dispatch(setSyncStatus("synced"));
        }).catch(() => {
          commandErr(noun);
          dispatch(setSyncStatus("sync_error"));
        });
    } else {
      if (getState()
        .bot
        .hardware
        .informational_settings
        .controller_version) {
        badVersion();
      } else {
        info(t("FarmBot is not connected."), t("Disconnected"), "red");
      }
    }
  };
}

export function execSequence(sequence: Sequence) {
  const noun = "Sequence execution";
  if (sequence.id) {
    return devices
      .current
      .execSequence(sequence.id)
      .then(commandOK(noun), commandErr(noun));
  } else {
    throw new Error("Can't execute unsaved sequences");
  }
}

export let saveAccountChanges: Thunk = function (dispatch, getState) {
  return save(getDeviceAccountSettings(getState().resources.index));
};

export let fetchReleases =
  (url: string) => (dispatch: Function, getState: Function) => {
    axios
      .get(url)
      .then((resp: HttpData<GithubRelease>) => {
        const version = resp.data.tag_name;
        const versionWithoutV = version.toLowerCase().replace("v", "");
        dispatch({
          type: "FETCH_OS_UPDATE_INFO_OK",
          payload: versionWithoutV
        });
      })
      .catch((ferror) => {
        error(t("Could not download firmware update information."));
        dispatch({
          type: "FETCH_OS_UPDATE_INFO_ERROR",
          payload: ferror
        });
      });
  };

export function save(input: TaggedDevice) {
  return function (dispatch: Function, getState: GetState) {
    return axios
      .put(API.current.devicePath, input.body)
      .then((resp: HttpData<User>) => dispatch({ type: "SAVE_DEVICE_OK", payload: resp.data }))
      .catch(resp => error(t("Error saving device settings.")));
  };
}

/**
 * Toggles visibility of individual sections in the giant controls panel
 * found on the Devices page.
 */
export function toggleControlPanel(payload: keyof ControlPanelState) {
  return { type: "TOGGLE_CONTROL_PANEL_OPTION", payload };
}

export function MCUFactoryReset() {
  return devices.current.resetMCU();
}

export function botConfigChange(key: ConfigKey, value: number) {
  const noun = "Setting toggle";

  return devices
    .current
    .updateMcu({ [key]: value })
    .then(_.noop, commandErr(noun));
}

export function settingToggle(
  name: ConfigKey, bot: BotState, displayAlert: string | undefined
) {
  if (displayAlert) { alert(displayAlert.replace(/\s+/g, " ")); }
  const noun = "Setting toggle";
  return devices
    .current
    .updateMcu({
      [name]: ((bot.hardware.mcu_params)[name] === 0) ? ON : OFF
    })
    .then(_.noop, commandErr(noun));
}

export function moveRelative(props: MoveRelProps) {
  return devices
    .current
    .moveRelative(props)
    .then(_.noop, commandErr("Relative movement"));
}

export function moveAbs(props: MoveRelProps) {
  const noun = "Absolute movement";
  return devices
    .current
    .moveAbsolute(props)
    .then(_.noop, commandErr(noun));
}

export function pinToggle(pin_number: number) {
  const noun = "Setting toggle";
  return devices
    .current
    .togglePin({ pin_number })
    .then(_.noop, commandErr(noun));
}

export function homeAll(speed: number) {
  const noun = "'Home All' command";
  devices
    .current
    .home({ axis: "all", speed })
    .then(commandOK(noun), commandErr(noun));
}

function readStatus() {
  const noun = "'Read Status' command";
  return devices
    .current
    .readStatus()
    .then(() => { commandOK(noun); }, () => { });
}

let NEED_VERSION_CHECK = true;
const bothUp = () => {
  dispatchNetworkUp("user.mqtt");
  dispatchNetworkUp("bot.mqtt");
};
// Already filtering messages in FarmBot OS and the API- this is just for
// an additional layer of safety. If sensitive data ever hits a client, it will
// be reported to ROllbar for investigation.
type ConnectDeviceReturn = {} | ((dispatch: Function) => void);
const BAD_WORDS = ["WPA", "PSK", "PASSWORD", "NERVES"];
export function connectDevice(token: string): ConnectDeviceReturn {
  return (dispatch: Function, getState: GetState) => {
    const secure = location.protocol === "https:";
    const bot = new Farmbot({ token, secure });
    bot.on("online", () => dispatchNetworkUp("user.mqtt"));
    bot.on("offline", () => {
      dispatchNetworkDown("user.mqtt");
      error(t(Content.MQTT_DISCONNECTED));
    });
    return bot
      .connect()
      .then(() => {
        devices.online = true;
        devices.current = bot;
        _.set(window, "current_bot", bot);
        readStatus()
          .then(() => bot.setUserEnv(
            { "LAST_CLIENT_CONNECTED": JSON.stringify(new Date()) }
          ))
          .catch(() => { });
        bot.on("logs", function (msg: Log) {
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
        });
        bot.on("status", _.throttle(function (msg: BotStateTree) {
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

        let alreadyToldYou = false;
        bot.on("malformed", function () {
          bothUp();
          if (!alreadyToldYou) {
            warning(t(Content.MALFORMED_MESSAGE_REC_UPGRADE));
            alreadyToldYou = true;
          }
        });
      }, (err) => dispatch(fetchDeviceErr(err)));
  };
}

function fetchDeviceErr(err: Error) {
  return {
    type: "FETCH_DEVICE_ERR",
    payload: err
  };
}

const startUpdate = () => {
  return {
    type: Actions.SETTING_UPDATE_START,
    payload: undefined
  };
};

const updateOK = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandOK(noun);
};

const updateNO = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandErr(noun);
};

export function updateMCU(key: ConfigKey, val: string) {
  const noun = "configuration update";
  return function (dispatch: Function, getState: () => Everything) {
    const state = getState().bot.hardware.mcu_params;

    function proceed() {
      dispatch(startUpdate());
      devices
        .current
        .updateMcu({ [key]: val })
        .then(() => updateOK(dispatch, noun))
        .catch(() => updateNO(dispatch, noun));
    }

    const dont = (err: string) => warning(err);

    const validate = mcuParamValidator(key, parseInt(val, 10), state);
    validate(proceed, dont);
  };
}

export function updateConfig(config: Configuration) {
  const noun = "Update Config";
  return function (dispatch: Function) {
    devices
      .current
      .updateConfig(config)
      .then(() => updateOK(dispatch, noun))
      .catch(() => updateNO(dispatch, noun));
  };
}

export function changeStepSize(integer: number) {
  return {
    type: "CHANGE_STEP_SIZE",
    payload: integer
  };
}

const CHANNELS: keyof Log = "channels";
const TOAST: ALLOWED_CHANNEL_NAMES = "toast";

function maybeShowLog(log: Log) {
  const chanList = _.get(log, CHANNELS, ["ERROR FETCHING CHANNELS"]);
  const m = log.meta.type as ALLOWED_MESSAGE_TYPES;
  const TITLE = "New message from bot";
  if (chanList.includes(TOAST)) {
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
  }
}

export function setSyncStatus(payload: SyncStatus) {
  return { type: "SET_SYNC_STATUS", payload };
}

function badVersion() {
  info(t("You are running an old version of FarmBot OS."), t("Please Update"), "red");
}
