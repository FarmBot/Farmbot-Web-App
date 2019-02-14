const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
  powerOff: jest.fn(() => { return Promise.resolve(); }),
  resetOS: jest.fn(),
  reboot: jest.fn(() => { return Promise.resolve(); }),
  rebootFirmware: jest.fn(() => { return Promise.resolve(); }),
  checkArduinoUpdates: jest.fn(() => { return Promise.resolve(); }),
  emergencyLock: jest.fn(() => { return Promise.resolve(); }),
  emergencyUnlock: jest.fn(() => { return Promise.resolve(); }),
  execSequence: jest.fn(() => { return Promise.resolve(); }),
  resetMCU: jest.fn(() => { return Promise.resolve(); }),
  updateMcu: jest.fn(() => { return Promise.resolve(); }),
  togglePin: jest.fn(() => { return Promise.resolve(); }),
  home: jest.fn(() => { return Promise.resolve(); }),
  sync: jest.fn(() => { return Promise.resolve(); }),
  readStatus: jest.fn(() => Promise.resolve()),
  updateConfig: jest.fn(() => Promise.resolve()),
  dumpInfo: jest.fn(() => Promise.resolve()),
};

jest.mock("../../device", () => ({
  getDevice: () => {
    return mockDevice;
  }
}));

let mockGetRelease: Promise<{}> = Promise.resolve({});
jest.mock("axios", () => ({
  get: jest.fn(() => { return mockGetRelease; })
}));

import * as actions from "../actions";
import {
  fakeFbosConfig, fakeFirmwareConfig
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  changeStepSize, resetNetwork, resetConnectionInfo, commandErr
} from "../actions";
import { Actions } from "../../constants";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { API } from "../../api/index";
import axios from "axios";
import { SpecialStatus, McuParamName } from "farmbot";
import { bot } from "../../__test_support__/fake_state/bot";
import { success, error, warning, info } from "farmbot-toastr";

describe("checkControllerUpdates()", function () {
  it("calls checkUpdates", async () => {
    await actions.checkControllerUpdates();
    expect(mockDevice.checkUpdates).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("powerOff()", function () {
  it("calls powerOff", async () => {
    await actions.powerOff();
    expect(mockDevice.powerOff).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("factoryReset()", () => {
  it("doesn't call factoryReset", async () => {
    window.confirm = () => false;
    await actions.factoryReset();
    expect(mockDevice.resetOS).not.toHaveBeenCalled();
  });

  it("calls factoryReset", async () => {
    window.confirm = () => true;
    await actions.factoryReset();
    expect(mockDevice.resetOS).toHaveBeenCalled();
  });
});

describe("reboot()", function () {
  it("calls reboot", async () => {
    await actions.reboot();
    expect(mockDevice.reboot).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("restartFirmware()", function () {
  it("calls restartFirmware", async () => {
    await actions.restartFirmware();
    expect(mockDevice.rebootFirmware).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("emergencyLock() / emergencyUnlock", function () {
  it("calls emergencyLock", () => {
    actions.emergencyLock();
    expect(mockDevice.emergencyLock).toHaveBeenCalled();
  });

  it("calls emergencyUnlock", () => {
    window.confirm = () => true;
    actions.emergencyUnlock();
    expect(mockDevice.emergencyUnlock).toHaveBeenCalled();
  });

  it("doesn't call emergencyUnlock", () => {
    window.confirm = () => false;
    actions.emergencyUnlock();
    expect(mockDevice.emergencyUnlock).not.toHaveBeenCalled();
  });
});

describe("sync()", function () {
  it("calls sync", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "999.0.0";
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.sync).toHaveBeenCalled();
  });

  it("calls badVersion", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "1.0.0";
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.sync).not.toHaveBeenCalled();
    expect(info).toBeCalledWith(
      expect.stringContaining("old version"),
      expect.stringContaining("Please Update"),
      "red");
  });

  it("doesn't call sync: disconnected", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = undefined;
    actions.sync()(jest.fn(), () => state);
    expect(mockDevice.sync).not.toHaveBeenCalled();
    const expectedMessage = ["FarmBot is not connected.", "Disconnected", "red"];
    expect(info).toBeCalledWith(...expectedMessage);
  });
});

describe("execSequence()", function () {
  it("calls execSequence", async () => {
    await actions.execSequence(1);
    expect(mockDevice.execSequence).toHaveBeenCalledWith(1);
    expect(success).toHaveBeenCalled();
  });

  it("calls execSequence with variables", async () => {
    await actions.execSequence(1, []);
    expect(mockDevice.execSequence).toHaveBeenCalledWith(1, []);
    expect(success).toHaveBeenCalled();
  });

  it("implodes when executing unsaved sequences", () => {
    expect(() => actions.execSequence(undefined)).toThrow();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
  });
});

describe("MCUFactoryReset()", function () {
  it("doesn't call resetMCU", () => {
    window.confirm = () => false;
    actions.MCUFactoryReset();
    expect(mockDevice.resetMCU).not.toHaveBeenCalled();
  });

  it("calls resetMCU", () => {
    window.confirm = () => true;
    actions.MCUFactoryReset();
    expect(mockDevice.resetMCU).toHaveBeenCalled();
  });
});

describe("requestDiagnostic", () => {
  it("requests that FBOS build a diagnostic report", () => {
    actions.requestDiagnostic();
    expect(mockDevice.dumpInfo).toHaveBeenCalled();
  });
});

describe("settingToggle()", () => {
  it("toggles mcu param via updateMcu", async () => {
    bot.hardware.mcu_params.param_mov_nr_retry = 0;
    const sourceSetting = (x: McuParamName) =>
      ({ value: bot.hardware.mcu_params[x], consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = false;
    state.resources = buildResourceIndex([fakeConfig]);
    await actions.settingToggle(
      "param_mov_nr_retry", sourceSetting)(jest.fn(), () => state);
    expect(mockDevice.updateMcu)
      .toHaveBeenCalledWith({ param_mov_nr_retry: 1 });
  });

  it("toggles mcu param via FirmwareConfig", async () => {
    bot.hardware.mcu_params.param_mov_nr_retry = 1;
    const sourceSetting = (x: McuParamName) =>
      ({ value: bot.hardware.mcu_params[x], consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = true;
    state.resources = buildResourceIndex([fakeConfig]);
    const dispatch = jest.fn();
    await actions.settingToggle(
      "param_mov_nr_retry", sourceSetting)(dispatch, () => state);
    expect(mockDevice.updateMcu).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { param_mov_nr_retry: 0 },
        uuid: expect.stringContaining("FirmwareConfig")
      },
      type: Actions.EDIT_RESOURCE
    });
  });

  it("displays an alert message", () => {
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = false;
    window.alert = jest.fn();
    const msg = "this is an alert.";
    actions.settingToggle(
      "param_mov_nr_retry", jest.fn(() => ({ value: 1, consistent: true })),
      msg)(jest.fn(), fakeState);
    expect(window.alert).toHaveBeenCalledWith(msg);
  });
});

describe("updateMCU()", () => {
  it("updates mcu param via updateMcu", async () => {
    bot.hardware.mcu_params.param_mov_nr_retry = 0;
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = false;
    state.resources = buildResourceIndex([fakeConfig]);
    await actions.updateMCU(
      "param_mov_nr_retry", "1")(jest.fn(), () => state);
    expect(mockDevice.updateMcu)
      .toHaveBeenCalledWith({ param_mov_nr_retry: "1" });
  });

  it("updates mcu param via FirmwareConfig", async () => {
    bot.hardware.mcu_params.param_mov_nr_retry = 1;
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = true;
    state.resources = buildResourceIndex([fakeConfig]);
    const dispatch = jest.fn();
    await actions.updateMCU(
      "param_mov_nr_retry", "0")(dispatch, () => state);
    expect(mockDevice.updateMcu).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { param_mov_nr_retry: "0" },
        uuid: expect.stringContaining("FirmwareConfig")
      },
      type: Actions.EDIT_RESOURCE
    });
  });

  it("prevents update with incompatible value", async () => {
    bot.hardware.mcu_params.movement_max_spd_x = 0;
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = false;
    state.resources = buildResourceIndex([fakeConfig]);
    await actions.updateMCU(
      "movement_min_spd_x", "100")(jest.fn(), () => state);
    expect(mockDevice.updateMcu).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(
      "Minimum speed should always be lower than maximum");
  });

  it("catches error", async () => {
    mockDevice.updateMcu = jest.fn(() => { return Promise.reject(); });
    const dispatch = jest.fn();
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.api_migrated = false;
    state.resources = buildResourceIndex([fakeConfig]);
    await actions.updateMCU(
      "param_mov_nr_retry", "1")(dispatch, () => state);
    await expect(mockDevice.updateMcu).toHaveBeenCalled();
    expect(dispatch).toHaveBeenLastCalledWith({
      payload: undefined, type: Actions.SETTING_UPDATE_END
    });
    expect(error).toHaveBeenCalledWith("Firmware config update failed");
  });
});

describe("pinToggle()", function () {
  it("calls togglePin", async () => {
    await actions.pinToggle(5);
    expect(mockDevice.togglePin).toHaveBeenCalledWith({ pin_number: 5 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("homeAll()", function () {
  it("calls home", async () => {
    await actions.homeAll(100);
    expect(mockDevice.home)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("isLog()", function () {
  it("knows if it is a log or not", () => {
    expect(actions.isLog({})).toBe(false);
    expect(actions.isLog({ message: "foo" })).toBe(true);
  });

  it("filters sensitive logs", () => {
    expect(() => actions.isLog({ message: "NERVESPSKWPASSWORD" }))
      .toThrowError(/Refusing to display log/);
  });
});

describe("commandErr()", () => {
  it("sends toast", () => {
    commandErr()();
    expect(error).toHaveBeenCalledWith("Command failed");
  });
});

describe("toggleControlPanel()", function () {
  it("toggles", () => {
    const action = actions.toggleControlPanel("homing_and_calibration");
    expect(action.payload).toEqual("homing_and_calibration");
  });
});

describe("changeStepSize()", () => {
  it("returns a redux action", () => {
    const payload = 23;
    const result = changeStepSize(payload);
    expect(result.type).toBe(Actions.CHANGE_STEP_SIZE);
    expect(result.payload).toBe(payload);
  });
});

describe("resetNetwork()", () => {
  it("renders correct info", () => {
    const result = resetNetwork();
    expect(result.payload).toEqual({});
    expect(result.type).toEqual(Actions.RESET_NETWORK);
  });
});

describe("resetConnectionInfo()", () => {
  it("dispatches the right actions", () => {
    const mock1 = jest.fn();
    API.setBaseUrl("http://localhost:300");
    resetConnectionInfo()(mock1);
    expect(mock1).toHaveBeenCalledWith(resetNetwork());
    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mockDevice.readStatus).toHaveBeenCalled();
  });
});

describe("fetchReleases()", () => {
  it("fetches latest OS release version", async () => {
    mockGetRelease = Promise.resolve({ data: { tag_name: "v1.0.0" } });
    const dispatch = jest.fn();
    await actions.fetchReleases("url")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: { version: "1.0.0", commit: undefined },
      type: Actions.FETCH_OS_UPDATE_INFO_OK
    });
  });

  it("fetches latest beta OS release version", async () => {
    mockGetRelease = Promise.resolve({
      data: { tag_name: "v1.0.0-beta", target_commitish: "commit" }
    });
    const dispatch = jest.fn();
    await actions.fetchReleases("url", { beta: true })(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: { version: "1.0.0-beta", commit: "commit" },
      type: Actions.FETCH_BETA_OS_UPDATE_INFO_OK
    });
  });

  it("fails to fetches latest OS release version", async () => {
    mockGetRelease = Promise.reject("error");
    const dispatch = jest.fn();
    await actions.fetchReleases("url")(dispatch);
    await expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).toHaveBeenCalledWith(
      "Could not download FarmBot OS update information.");
    expect(dispatch).toHaveBeenCalledWith({
      payload: "error",
      type: Actions.FETCH_OS_UPDATE_INFO_ERROR
    });
  });

  it("fails to fetches latest beta OS release version", async () => {
    mockGetRelease = Promise.reject("error");
    const dispatch = jest.fn();
    await actions.fetchReleases("url", { beta: true })(dispatch);
    await expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: "error",
      type: Actions.FETCH_BETA_OS_UPDATE_INFO_ERROR
    });
  });
});

describe("fetchLatestGHBetaRelease()", () => {
  it("fetches latest beta OS release version", async () => {
    mockGetRelease = Promise.resolve({ data: [{ tag_name: "v1.0.0-beta" }] });
    const dispatch = jest.fn();
    await actions.fetchLatestGHBetaRelease("url/001")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: { version: "1.0.0-beta", commit: undefined },
      type: Actions.FETCH_BETA_OS_UPDATE_INFO_OK
    });
  });

  it("fails to fetches latest beta OS release version", async () => {
    mockGetRelease = Promise.reject("error");
    const dispatch = jest.fn();
    await actions.fetchLatestGHBetaRelease("url/001")(dispatch);
    await expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: "error",
      type: Actions.FETCH_BETA_OS_UPDATE_INFO_ERROR
    });
  });
});

describe("fetchMinOsFeatureData()", () => {
  afterEach(() =>
    jest.restoreAllMocks());

  it("fetches min OS feature data: empty", async () => {
    mockGetRelease = Promise.resolve({ data: {} });
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData("url")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(dispatch).toHaveBeenCalledWith({
      payload: {},
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK
    });
  });

  it("fetches min OS feature data", async () => {
    mockGetRelease = Promise.resolve({
      data: { "a_feature": "1.0.0", "b_feature": "2.0.0" }
    });
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData("url")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(dispatch).toHaveBeenCalledWith({
      payload: { a_feature: "1.0.0", b_feature: "2.0.0" },
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK
    });
  });

  it("fetches bad min OS feature data: not an object", async () => {
    mockGetRelease = Promise.resolve({ data: "bad" });
    const dispatch = jest.fn();
    const mockConsole = jest.spyOn(console, "log").mockImplementation(() => { });
    await actions.fetchMinOsFeatureData("url")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockConsole).toHaveBeenCalledWith(
      expect.stringContaining("\"bad\""));
  });

  it("fetches bad min OS feature data", async () => {
    mockGetRelease = Promise.resolve({ data: { a: "0", b: 0 } });
    const dispatch = jest.fn();
    const mockConsole = jest.spyOn(console, "log").mockImplementation(() => { });
    await actions.fetchMinOsFeatureData("url")(dispatch);
    expect(axios.get).toHaveBeenCalledWith("url");
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockConsole).toHaveBeenCalledWith(
      expect.stringContaining("{\"a\":\"0\",\"b\":0}"));
  });

  it("fails to fetch min OS feature data", async () => {
    mockGetRelease = Promise.reject("error");
    const dispatch = jest.fn();
    await actions.fetchMinOsFeatureData("url")(dispatch);
    await expect(axios.get).toHaveBeenCalledWith("url");
    expect(error).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: "error",
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_ERROR
    });
  });
});

describe("updateConfig()", () => {
  it("updates config: configUpdate", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources.index = buildResourceIndex([fakeFbosConfig()]).index;
    actions.updateConfig({ auto_sync: true })(dispatch, () => state);
    expect(mockDevice.updateConfig).toHaveBeenCalledWith({ auto_sync: true });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("updates config: FbosConfig", () => {
    const dispatch = jest.fn(() => Promise.resolve());
    const state = fakeState();
    const fakeFBOSConfig = fakeFbosConfig();
    fakeFBOSConfig.body.api_migrated = true;
    state.resources.index = buildResourceIndex([fakeFBOSConfig]).index;
    actions.updateConfig({ auto_sync: true })(dispatch, () => state);
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { auto_sync: true },
        uuid: expect.stringContaining("FbosConfig")
      },
      type: Actions.EDIT_RESOURCE
    });
  });
});

describe("badVersion()", () => {
  it("warns of old FBOS version", () => {
    actions.badVersion();
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining("old version"), "Please Update", "red");
  });
});
