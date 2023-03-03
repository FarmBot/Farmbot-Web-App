const mockDeviceDefault: DeepPartial<Farmbot> = {
  checkUpdates: jest.fn(() => Promise.resolve()),
  powerOff: jest.fn(() => Promise.resolve()),
  resetOS: jest.fn(),
  reboot: jest.fn(() => Promise.resolve()),
  rebootFirmware: jest.fn(() => Promise.resolve()),
  flashFirmware: jest.fn(() => Promise.resolve()),
  emergencyLock: jest.fn(() => Promise.resolve()),
  emergencyUnlock: jest.fn(() => Promise.resolve()),
  execSequence: jest.fn(() => Promise.resolve()),
  takePhoto: jest.fn(() => Promise.resolve()),
  resetMCU: jest.fn(() => Promise.resolve()),
  moveRelative: jest.fn(() => Promise.resolve()),
  moveAbsolute: jest.fn(() => Promise.resolve()),
  togglePin: jest.fn(() => Promise.resolve()),
  readPin: jest.fn(() => Promise.resolve()),
  writePin: jest.fn(() => Promise.resolve()),
  home: jest.fn(() => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
  sync: jest.fn(() => Promise.resolve()),
  send: jest.fn(() => Promise.resolve()),
  readStatus: jest.fn(() => Promise.resolve()),
};

const mockDevice = { current: mockDeviceDefault };
jest.mock("../../device", () => ({ getDevice: () => mockDevice.current }));

jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../settings/maybe_highlight", () => ({
  goToFbosSettings: jest.fn(),
}));

let mockGet: Promise<{}> = Promise.resolve({});
jest.mock("axios", () => ({ get: jest.fn(() => mockGet) }));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    getState: () => mockState,
    dispatch: jest.fn(),
  },
}));

import * as actions from "../actions";
import {
  fakeFirmwareConfig, fakeFbosConfig,
} from "../../__test_support__/fake_state/resources";
import { Actions, Content } from "../../constants";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import axios from "axios";
import { success, error, warning, info } from "../../toast/toast";
import { edit, save } from "../../api/crud";
import { DeepPartial } from "redux";
import { Farmbot } from "farmbot";
import { goToFbosSettings } from "../../settings/maybe_highlight";

const replaceDeviceWith = async (d: DeepPartial<Farmbot>, cb: Function) => {
  jest.clearAllMocks();
  mockDevice.current = { ...mockDeviceDefault, ...d };
  await cb();
  mockDevice.current = mockDeviceDefault;
};

describe("sendRPC()", () => {
  it("calls sendRPC", async () => {
    await actions.sendRPC({ kind: "sync", args: {} });
    expect(mockDevice.current.send).toHaveBeenCalledWith({
      kind: "rpc_request",
      args: { label: expect.any(String), priority: 600 },
      body: [{ kind: "sync", args: {} }],
    });
  });
});

describe("readStatus()", () => {
  it("calls readStatus", async () => {
    await actions.readStatus();
    expect(mockDevice.current.readStatus).toHaveBeenCalled();
  });
});

describe("readStatusReturnPromise()", () => {
  it("calls readStatusReturnPromise", async () => {
    await actions.readStatusReturnPromise();
    expect(mockDevice.current.readStatus).toHaveBeenCalled();
  });
});

describe("checkControllerUpdates()", () => {
  it("calls checkUpdates", async () => {
    await actions.checkControllerUpdates();
    expect(mockDevice.current.checkUpdates).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("powerOff()", () => {
  it("calls powerOff", async () => {
    await actions.powerOff();
    expect(mockDevice.current.powerOff).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("softReset()", () => {
  it("doesn't call softReset", async () => {
    window.confirm = () => false;
    await actions.softReset();
    expect(mockDevice.current.resetOS).not.toHaveBeenCalled();
  });

  it("calls softReset", async () => {
    window.confirm = () => true;
    await actions.softReset();
    expect(mockDevice.current.resetOS).toHaveBeenCalled();
  });
});

describe("reboot()", () => {
  it("calls reboot", async () => {
    await actions.reboot();
    expect(mockDevice.current.reboot).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("restartFirmware()", () => {
  it("calls restartFirmware", async () => {
    await actions.restartFirmware();
    expect(mockDevice.current.rebootFirmware).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("flashFirmware()", () => {
  it("calls flashFirmware", async () => {
    await actions.flashFirmware("arduino");
    expect(mockDevice.current.flashFirmware).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("emergencyLock() / emergencyUnlock", () => {
  it("calls emergencyLock", () => {
    actions.emergencyLock();
    expect(mockDevice.current.emergencyLock).toHaveBeenCalled();
  });

  it("calls emergencyUnlock", () => {
    window.confirm = () => true;
    actions.emergencyUnlock();
    expect(mockDevice.current.emergencyUnlock).toHaveBeenCalled();
  });

  it("doesn't call emergencyUnlock", () => {
    window.confirm = () => false;
    actions.emergencyUnlock();
    expect(mockDevice.current.emergencyUnlock).not.toHaveBeenCalled();
  });

  it("forces emergencyUnlock", () => {
    window.confirm = () => false;
    actions.emergencyUnlock(true);
    expect(mockDevice.current.emergencyUnlock).toHaveBeenCalled();
  });
});

describe("sync()", () => {
  it("calls sync", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "999.0.0";
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).toHaveBeenCalled();
  });

  it("calls badVersion", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "1.0.0";
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).not.toHaveBeenCalled();
    expectBadVersionCall();
  });

  it("doesn't call sync: disconnected", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = undefined;
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("FarmBot is not connected.", {
      title: "Disconnected", color: "red",
    });
  });
});

describe("execSequence()", () => {
  it("handles normal errors", () => {
    const errorThrower: DeepPartial<Farmbot> = {
      execSequence: jest.fn(() => Promise.reject(new Error("yolo")))
    };

    replaceDeviceWith(errorThrower, async () => {
      await actions.execSequence(1, []);
      expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, []);
      expect(error).toHaveBeenCalledWith("yolo");
    });
  });

  it("handles unexpected errors", async () => {
    const errorThrower: DeepPartial<Farmbot> = {
      execSequence: jest.fn(() => Promise.reject("unexpected"))
    };

    await replaceDeviceWith(errorThrower, async () => {
      await actions.execSequence(22, []);
      expect(mockDevice.current.execSequence).toHaveBeenCalledWith(22, []);
      expect(error).toHaveBeenCalledWith("Sequence execution failed");
    });
  });

  it("calls execSequence", async () => {
    await actions.execSequence(1);
    expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, undefined);
    expect(success).toHaveBeenCalled();
  });

  it("calls execSequence with variables", async () => {
    await actions.execSequence(1, []);
    expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, []);
    expect(success).toHaveBeenCalled();
  });

  it("implodes when executing unsaved sequences", () => {
    expect(() => actions.execSequence(undefined)).toThrow();
    expect(mockDevice.current.execSequence).not.toHaveBeenCalled();
  });
});

describe("takePhoto()", () => {
  it("calls takePhoto", async () => {
    await actions.takePhoto();
    expect(mockDevice.current.takePhoto).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(Content.PROCESSING_PHOTO,
      { title: "Request sent" });
    expect(error).not.toHaveBeenCalled();
  });

  it("calls takePhoto: error", async () => {
    mockDevice.current.takePhoto = jest.fn(() => Promise.reject("error"));
    await actions.takePhoto();
    await expect(mockDevice.current.takePhoto).toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Error taking photo");
  });
});

describe("MCUFactoryReset()", () => {
  it("doesn't call resetMCU", () => {
    window.confirm = () => false;
    actions.MCUFactoryReset();
    expect(mockDevice.current.resetMCU).not.toHaveBeenCalled();
  });

  it("calls resetMCU", () => {
    window.confirm = () => true;
    actions.MCUFactoryReset();
    expect(mockDevice.current.resetMCU).toHaveBeenCalled();
  });
});

describe("settingToggle()", () => {
  it("toggles mcu param via FirmwareConfig", () => {
    const sourceSetting = () => ({ value: 1, consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    actions.settingToggle(
      "param_mov_nr_retry", sourceSetting)(jest.fn(), () => state);
    expect(edit).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: 0 });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("toggles mcu param on", () => {
    const sourceSetting = () => ({ value: 0, consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    actions.settingToggle(
      "param_mov_nr_retry", sourceSetting)(jest.fn(), () => state);
    expect(edit).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: 1 });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("displays an alert message", () => {
    window.alert = jest.fn();
    const msg = "this is an alert.";
    actions.settingToggle(
      "param_mov_nr_retry", jest.fn(() => ({ value: 1, consistent: true })),
      msg)(jest.fn(), fakeState);
    expect(window.alert).toHaveBeenCalledWith(msg);
  });
});

describe("updateMCU()", () => {
  it("updates mcu param via FirmwareConfig", () => {
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    actions.updateMCU("param_mov_nr_retry", "0")(jest.fn(), () => state);
    expect(edit).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: "0" });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    expect(warning).not.toHaveBeenCalled();
  });

  it("handles missing FirmwareConfig", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    actions.updateMCU("param_mov_nr_retry", "0")(jest.fn(), () => state);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });

  it("prevents update with incompatible value", () => {
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.movement_max_spd_x = 0;
    state.resources = buildResourceIndex([fakeConfig]);
    actions.updateMCU("movement_min_spd_x", "100")(jest.fn(), () => state);
    expect(warning).toHaveBeenCalledWith(
      "Minimum speed should always be lower than maximum");
  });
});

describe("moveRelative()", () => {
  it("calls moveRelative", async () => {
    await actions.moveRelative({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveRelative)
      .toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(success).not.toHaveBeenCalled();
  });

  it("shows lock message", () => {
    mockState.bot.hardware.informational_settings.locked = true;
    actions.moveRelative({ x: 1, y: 0, z: 0 });
    expect(error).toHaveBeenCalledWith("Command not available while locked.",
      { title: "Emergency stop active" });
    mockState.bot.hardware.informational_settings.locked = false;
  });
});

describe("moveAbsolute()", () => {
  it("calls moveAbsolute", async () => {
    await actions.moveAbsolute({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveAbsolute)
      .toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("move()", () => {
  it("calls move", async () => {
    await actions.move({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: [{
            kind: "axis_overwrite",
            args: {
              axis: "x",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "y",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "z",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          }],
        }],
      });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls move with speed", async () => {
    await actions.move({ x: 1, y: 0, z: 0, speed: 50 });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: [{
            kind: "axis_overwrite",
            args: {
              axis: "x",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "y",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "z",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "speed_overwrite",
            args: {
              axis: "x",
              speed_setting: { kind: "numeric", args: { number: 50 } },
            }
          },
          {
            kind: "speed_overwrite",
            args: {
              axis: "y",
              speed_setting: { kind: "numeric", args: { number: 50 } },
            }
          },
          {
            kind: "speed_overwrite",
            args: {
              axis: "z",
              speed_setting: { kind: "numeric", args: { number: 50 } },
            }
          },
          ],
        }],
      });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls move with safe z", async () => {
    await actions.move({ x: 1, y: 0, z: 0, safeZ: true });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: [{
            kind: "axis_overwrite",
            args: {
              axis: "x",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "y",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          {
            kind: "axis_overwrite",
            args: {
              axis: "z",
              axis_operand: { kind: "coordinate", args: { x: 1, y: 0, z: 0 } },
            }
          },
          { kind: "safe_z", args: {} }]
        }],
      });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("pinToggle()", () => {
  it("calls togglePin", async () => {
    await actions.pinToggle(5);
    expect(mockDevice.current.togglePin).toHaveBeenCalledWith({ pin_number: 5 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("readPin()", () => {
  it("calls readPin", async () => {
    await actions.readPin(1, "label", 0);
    expect(mockDevice.current.readPin).toHaveBeenCalledWith({
      pin_number: 1, label: "label", pin_mode: 0,
    });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("writePin()", () => {
  it("calls writePin", async () => {
    await actions.writePin(1, 1, 0);
    expect(mockDevice.current.writePin).toHaveBeenCalledWith({
      pin_number: 1, pin_value: 1, pin_mode: 0,
    });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("moveToHome()", () => {
  it("calls home", async () => {
    await actions.moveToHome("x");
    expect(mockDevice.current.home)
      .toHaveBeenCalledWith({ axis: "x", speed: 100 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("findHome()", () => {
  it("calls find_home", async () => {
    await actions.findHome("all");
    expect(mockDevice.current.findHome)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("isLog()", () => {
  it("knows if it is a log or not", () => {
    expect(actions.isLog({})).toBe(false);
    expect(actions.isLog({ message: "foo" })).toBe(true);
  });

  it("filters sensitive logs", () => {
    const log = { message: "NERVESPSKWPASSWORD" };
    console.error = jest.fn();
    const result = actions.isLog(log);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Refusing to display log"));
  });
});

describe("commandErr()", () => {
  it("sends toast", () => {
    actions.commandErr()();
    expect(error).toHaveBeenCalledWith("Command failed");
  });
});

describe("commandOK()", () => {
  it("sends toast", () => {
    actions.commandOK()();
    expect(success).toHaveBeenCalledWith(
      "Command request sent to device.",
      { title: "Request sent" });
  });

  it("sends demo account toast", () => {
    localStorage.setItem("myBotIs", "online");
    actions.commandOK()();
    expect(success).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(
      "Sorry, that feature is unavailable in demo accounts.",
      { title: "Unavailable" });
  });
});

describe("changeStepSize()", () => {
  it("returns a redux action", () => {
    const payload = 23;
    const result = actions.changeStepSize(payload);
    expect(result.type).toBe(Actions.CHANGE_STEP_SIZE);
    expect(result.payload).toBe(payload);
  });
});

describe("fetchMinOsFeatureData()", () => {
  const EXPECTED_URL = expect.stringContaining("FEATURE_MIN_VERSIONS.json");

  it("fetches min OS feature data: empty", async () => {
    mockGet = Promise.resolve({ data: {} });
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).toHaveBeenCalledWith({
      payload: {},
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK
    });
  });

  it("fetches min OS feature data", async () => {
    mockGet = Promise.resolve({
      data: { "a_feature": "1.0.0", "b_feature": "2.0.0" }
    });
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).toHaveBeenCalledWith({
      payload: { a_feature: "1.0.0", b_feature: "2.0.0" },
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK
    });
  });

  it("fetches bad min OS feature data: not an object", async () => {
    mockGet = Promise.resolve({ data: "bad" });
    const dispatch = jest.fn();
    console.log = jest.fn();
    await actions.fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("\"bad\""));
  });

  it("fetches bad min OS feature data", async () => {
    mockGet = Promise.resolve({ data: { a: "0", b: 0 } });
    const dispatch = jest.fn();
    console.log = jest.fn();
    await actions.fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("{\"a\":\"0\",\"b\":0}"));
  });

  it("fails to fetch min OS feature data", async () => {
    mockGet = Promise.reject("error");
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData()(dispatch);
    await expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: "error",
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_ERROR
    });
  });
});

describe("fetchOsReleaseNotes()", () => {
  const EXPECTED_URL = expect.stringContaining("RELEASE_NOTES.md");

  it("fetches OS release notes", async () => {
    mockGet = Promise.resolve({
      data: "intro\n\n# v6\n\n* note"
    });
    const dispatch = jest.fn();
    await actions.fetchOsReleaseNotes()(dispatch);
    await expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).toHaveBeenCalledWith({
      payload: "intro\n\n# v6\n\n* note",
      type: Actions.FETCH_OS_RELEASE_NOTES_OK
    });
  });

  it("errors while fetching OS release notes", async () => {
    mockGet = Promise.reject({ error: "" });
    const dispatch = jest.fn();
    await actions.fetchOsReleaseNotes()(dispatch);
    await expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).toHaveBeenCalledWith({
      payload: { error: "" },
      type: Actions.FETCH_OS_RELEASE_NOTES_ERROR
    });
  });
});

describe("updateConfig()", () => {
  it("updates config: FbosConfig", () => {
    const state = fakeState();
    const fakeConfig = fakeFbosConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    actions.updateConfig({ os_auto_update: true })(jest.fn(), () => state);
    expect(edit).toHaveBeenCalledWith(fakeConfig, { os_auto_update: true });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("doesn't update FbosConfig", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    actions.updateConfig({ os_auto_update: true })(jest.fn(), () => state);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

const expectBadVersionCall = () => {
  expect(goToFbosSettings).toHaveBeenCalled();
  expect(error).toHaveBeenCalledWith(expect.stringContaining("old version"), {
    title: "Please Update",
    noTimer: true,
    noDismiss: true,
    idPrefix: "EOL",
  });
};

describe("badVersion()", () => {
  it("warns of old FBOS version", () => {
    actions.badVersion();
    expectBadVersionCall();
  });

  it("warns of old FBOS version: dismiss-able", () => {
    actions.badVersion({ noDismiss: false });
    expect(goToFbosSettings).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("old version"), {
      title: "Please Update",
      noTimer: true,
      noDismiss: false,
      idPrefix: "EOL",
    });
  });
});
