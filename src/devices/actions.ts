import { Farmbot } from "farmbot";
import { t } from "i18next";
import { get } from "axios";
import * as Axios from "axios";
import * as _ from "lodash";
import { success, warning, info, error } from "farmbot-toastr";
import { devices } from "../device";
import { Log } from "../interfaces";
import { GithubRelease, MoveRelProps } from "./interfaces";
import { Thunk, GetState } from "../redux/interfaces";
import { DeviceAccountSettings, BotState } from "../devices/interfaces";
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
import { init, edit } from "../api/crud";
import { getDeviceAccountSettings } from "../resources/selectors";
import { TaggedDevice } from "../resources/tagged_resources";
import { versionOK } from "./reducer";
import { oneOf } from "../util";

const ON = 1, OFF = 0;
type configKey = keyof McuParams;

function incomingStatus(statusMessage: HardwareState) {
  return { type: "BOT_CHANGE", payload: statusMessage };
}

function isLog(x: any): x is Log {
  return _.isObject(x) && _.isString(x.message);
}

export function checkControllerUpdates() {
  let noun = "Check for Updates";
  devices
    .current
    .checkUpdates()
    .then(commandOK(noun), commandErr(noun));
}

export function powerOff() {
  let noun = "Power Off Bot";
  devices
    .current
    .powerOff()
    .then(commandOK(noun), commandErr(noun));
}

export function factoryReset() {
  if (!confirm("WAIT! This will erase EVERYTHING stored on your device SD " +
    "card. Are you sure?")) {
    return;
  }
  devices
    .current
    .resetOS();
}

export function reboot() {
  let noun = "Reboot Bot";
  devices
    .current
    .reboot()
    .then(commandOK(noun), commandErr(noun));
}

export function checkArduinoUpdates() {
  let noun = "Check Firmware Updates";
  devices
    .current
    .checkArduinoUpdates()
    .then(commandOK(noun), commandErr(noun));
}

export function emergencyLock() {
  let noun = "Emergency stop";
  devices
    .current
    .emergencyLock()
    .then(commandOK(noun), commandErr(noun));
}
const REBOOT_CONF = `Are you sure you want to unlock the device?
Device will reboot.`;
export function emergencyUnlock() {
  let noun = "Emergency unlock";
  if (confirm(REBOOT_CONF)) {
    devices
      .current
      .reboot() // .emergencyUnlock is broke ATM RC 8 Jun 2017
      .then(commandOK(noun), _.noop); // REMOVE NOOP WHEN YOU PUT BACK UNLOCK RC - June 8 2017
  }
}

export function sync(): Thunk {
  let noun = "Sync";
  return function (dispatch, getState) {
    let IS_OK = versionOK(getState()
      .bot
      .hardware
      .informational_settings
      .controller_version, 4, 0);
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
      badVersion();
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

let commandErr = (noun = "Command") => () => {
  let msg = noun + " request failed.";
  console.info("Took longer than 6 seconds: " + noun);
};

let commandOK = (noun = "Command") => () => {
  let msg = noun + " request sent to device.";
  success(msg, t("Request sent"));
};

export let fetchReleases =
  (url: string) => (dispatch: Function, getState: Function) => {
    get<GithubRelease>(url)
      .then((resp) => {
        let version = resp.data.tag_name;
        let versionWithoutV = version.slice(1, version.length);
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
    return Axios
      .put<User>(API.current.devicePath, input.body)
      .then(resp => dispatch({ type: "SAVE_DEVICE_OK", payload: resp.data }))
      .catch(resp => error("Error saving device settings."))
  }
}

/**
 * Toggles visibility of individual sections in the giant controls panel
 * found on the Devices page.
 */
export function toggleControlPanel(payload: keyof ControlPanelState) {
  return { type: "TOGGLE_CONTROL_PANEL_OPTION", payload };
}

export function changeDevice(device: TaggedDevice,
  update: Partial<DeviceAccountSettings>): Thunk {
  return function (dispatch, getState) {
    dispatch(edit(device, update));
    dispatch(save(getDeviceAccountSettings(getState().resources.index)));
  }
}


export function MCUFactoryReset() {
  return devices.current.resetMCU();
}

export function botConfigChange(key: configKey, value: number) {
  let noun = "Setting toggle";

  return devices
    .current
    .updateMcu({ [key]: value })
    .then(_.noop, commandErr(noun));
};

export function settingToggle(name: configKey, bot: BotState) {
  let noun = "Setting toggle";
  return devices
    .current
    .updateMcu({
      [name]: ((bot.hardware.mcu_params)[name] === 0) ? ON : OFF
    })
    .then(_.noop, commandErr(noun));
};

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
  let noun = "'Home All' command";
  devices
    .current
    .home({ axis: "all", speed })
    .then(commandOK(noun), commandErr(noun));
}

function readStatus() {
  let noun = "'Read Status' command";
  return devices
    .current
    .readStatus()
    .then(() => { commandOK(noun); }, () => { });
}

let NEED_VERSION_CHECK = true;
// Already filtering messages in FarmBot OS and the API- this is just for
// an additional layer of safety. If sensitive data ever hits a client, it will
// be reported to ROllbar for investigation.
const BAD_WORDS = ["WPA", "PSK", "PASSWORD", "NERVES"];
export function connectDevice(token: string): {} | ((dispatch: Function) => any) {
  return (dispatch: Function, getState: GetState) => {
    let secure = location.protocol === "https:";
    let bot = new Farmbot({ token, secure });
    return bot
      .connect()
      .then(() => {
        devices.online = true;
        devices.current = bot;
        (window as any)["current_bot"] = bot;
        readStatus()
          .then(() => bot.setUserEnv({ "LAST_CLIENT_CONNECTED": JSON.stringify(new Date()) }))
          .catch(() => { });
        bot.on("logs", function (msg: Log) {
          if (isLog(msg) && !oneOf(BAD_WORDS, msg.message.toUpperCase())) {
            maybeShowLog(msg);
            dispatch(init({ kind: "logs", uuid: "MUST_CHANGE", body: msg }));
          } else {
            throw new Error("Refusing to display log: " + JSON.stringify(msg));
          }
        });
        bot.on("status", function (msg: BotStateTree) {
          dispatch(incomingStatus(msg));
          if (NEED_VERSION_CHECK) {
            let IS_OK = versionOK(getState()
              .bot
              .hardware
              .informational_settings
              .controller_version, 4, 0);
            if (!IS_OK) { badVersion(); }
            NEED_VERSION_CHECK = false;
          }

        });

        let alreadyToldYou = false;
        bot.on("malformed", function () {
          if (!alreadyToldYou) {
            warning(t("FarmBot sent a malformed message. " +
              "You may need to upgrade FarmBot OS. " +
              "Please upgrade FarmBot OS and log back in."));
            alreadyToldYou = true;
          }
        });
      }, (err) => dispatch(fetchDeviceErr(err)));
  };
};

function fetchDeviceErr(err: Error) {
  return {
    type: "FETCH_DEVICE_ERR",
    payload: err
  };
}

let startUpdate = (dispatch: Function) => {
  dispatch({ type: "SETTING_UPDATE_START", payload: undefined });
}

let updateOK = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandOK(noun);
}

let updateNO = (dispatch: Function, noun: string) => {
  dispatch({ type: "SETTING_UPDATE_END", payload: undefined });
  commandErr(noun);
}

export function updateMCU(key: configKey, val: string) {
  let noun = "configuration update";
  return function (dispatch: Function) {
    startUpdate(dispatch);
    devices
      .current
      .updateMcu({ [key]: val })
      .then(() => updateOK(dispatch, noun))
      .catch(() => updateNO(dispatch, noun));
  }
}

export function updateConfig(config: Configuration) {
  let noun = "Update Config";
  return function (dispatch: Function) {
    devices
      .current
      .updateConfig(config)
      .then(() => updateOK(dispatch, noun))
      .catch(() => updateNO(dispatch, noun));
  }
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
  let chanList = _.get(log, CHANNELS, ["ERROR FETCHING CHANNELS"]);
  let t = log.meta.type as ALLOWED_MESSAGE_TYPES;
  const TITLE = "New message from bot"
  if (chanList.includes(TOAST)) {
    switch (t) {
      case "success":
        return success(log.message, TITLE)
      case "busy":
      case "warn":
      case "error":
        return error(log.message, TITLE)
      case "fun":
      case "info":
      default:
        return info(log.message, TITLE);
    }
  }
}

export function setSyncStatus(payload: SyncStatus) {
  return { type: "SET_SYNC_STATUS", payload }
}

function badVersion() {
  info("You are running an old version of FarmBot OS.", "Please Update", "red");
}
