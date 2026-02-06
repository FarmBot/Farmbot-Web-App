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
  calibrate: jest.fn(() => Promise.resolve()),
  sync: jest.fn(() => Promise.resolve()),
  send: jest.fn(() => Promise.resolve()),
  readStatus: jest.fn(() => Promise.resolve()),
};

const mockDevice = { current: mockDeviceDefault };
let mockGet: Promise<{}> = Promise.resolve({});

import { fakeState } from "../../__test_support__/fake_state";
let mockState = fakeState();
import { store } from "../../redux/store";
import * as deviceModule from "../../device";

import {
  fakeFirmwareConfig, fakeFbosConfig,
} from "../../__test_support__/fake_state/resources";
import { Actions, Content } from "../../constants";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import axios from "axios";
import { success, error, warning, info } from "../../toast/toast";
import * as crud from "../../api/crud";
import { DeepPartial } from "../../redux/interfaces";
import { EmergencyLock, Execute, Farmbot, Wait } from "farmbot";
import { Path } from "../../internal_urls";
import * as demoLuaRunner from "../../demo/lua_runner";
import * as demoLuaRunnerActions from "../../demo/lua_runner/actions";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let getDeviceSpy: jest.SpyInstance;
let axiosGetSpy: jest.SpyInstance;
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
const deviceActions = () =>
  jest.requireActual("../actions");

const replaceDeviceWith = async (d: DeepPartial<Farmbot>, cb: Function) => {
  jest.clearAllMocks();
  mockDevice.current = { ...mockDeviceDefault, ...d };
  await cb();
  mockDevice.current = mockDeviceDefault;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockState = fakeState();
  mockGet = Promise.resolve({});
  localStorage.removeItem("myBotIs");
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice.current as Farmbot);
  axiosGetSpy = jest.spyOn(axios, "get")
    .mockImplementation(() => mockGet as never);
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(demoLuaRunner, "runDemoSequence").mockImplementation(jest.fn());
  jest.spyOn(demoLuaRunner, "runDemoLuaCode").mockImplementation(jest.fn());
  jest.spyOn(demoLuaRunner, "csToLua").mockImplementation(jest.fn());
  jest.spyOn(demoLuaRunnerActions, "eStop").mockImplementation(jest.fn());
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
  getDeviceSpy.mockRestore();
  axiosGetSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  jest.restoreAllMocks();
});

describe("sendRPC()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls sendRPC", async () => {
    await deviceActions().sendRPC({ kind: "sync", args: {} });
    expect(mockDevice.current.send).toHaveBeenCalledWith({
      kind: "rpc_request",
      args: { label: expect.any(String), priority: 600 },
      body: [{ kind: "sync", args: {} }],
    });
  });

  it("calls sendRPC on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    const cmd: Wait = { kind: "wait", args: { milliseconds: 1000 } };
    await deviceActions().sendRPC(cmd);
    expect(mockDevice.current.send).not.toHaveBeenCalled();
    expect(demoLuaRunner.csToLua).toHaveBeenCalledWith(cmd);
  });

  it("calls sendRPC on demo accounts: estop", async () => {
    localStorage.setItem("myBotIs", "online");
    const cmd: EmergencyLock = { kind: "emergency_lock", args: {} };
    await deviceActions().sendRPC(cmd);
    expect(mockDevice.current.send).not.toHaveBeenCalled();
    expect(demoLuaRunner.csToLua).not.toHaveBeenCalled();
    expect(demoLuaRunnerActions.eStop).toHaveBeenCalled();
  });

  it("calls sendRPC on demo accounts: execute", async () => {
    localStorage.setItem("myBotIs", "online");
    const cmd: Execute = { kind: "execute", args: { sequence_id: 1 }, body: [] };
    await deviceActions().sendRPC(cmd);
    expect(mockDevice.current.send).not.toHaveBeenCalled();
    expect(demoLuaRunner.csToLua).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoSequence).toHaveBeenCalledWith(
      expect.any(Object),
      1,
      [],
    );
  });
});

describe("readStatus()", () => {
  it("calls readStatus", async () => {
    await deviceActions().readStatus();
    expect(mockDevice.current.readStatus).toHaveBeenCalled();
  });
});

describe("readStatusReturnPromise()", () => {
  it("calls readStatusReturnPromise", async () => {
    await deviceActions().readStatusReturnPromise();
    expect(mockDevice.current.readStatus).toHaveBeenCalled();
  });
});

describe("checkControllerUpdates()", () => {
  it("calls checkUpdates", async () => {
    await deviceActions().checkControllerUpdates();
    expect(mockDevice.current.checkUpdates).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("powerOff()", () => {
  it("calls powerOff", async () => {
    await deviceActions().powerOff();
    expect(mockDevice.current.powerOff).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("softReset()", () => {
  it("doesn't call softReset", async () => {
    window.confirm = () => false;
    await deviceActions().softReset();
    expect(mockDevice.current.resetOS).not.toHaveBeenCalled();
  });

  it("calls softReset", async () => {
    window.confirm = () => true;
    await deviceActions().softReset();
    expect(mockDevice.current.resetOS).toHaveBeenCalled();
  });
});

describe("reboot()", () => {
  it("calls reboot", async () => {
    await deviceActions().reboot();
    expect(mockDevice.current.reboot).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("restartFirmware()", () => {
  it("calls restartFirmware", async () => {
    await deviceActions().restartFirmware();
    expect(mockDevice.current.rebootFirmware).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("flashFirmware()", () => {
  it("calls flashFirmware", async () => {
    await deviceActions().flashFirmware("arduino");
    expect(mockDevice.current.flashFirmware).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
  });
});

describe("emergencyLock() / emergencyUnlock", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
    window.confirm = () => false;
  });

  it("calls emergencyLock", () => {
    deviceActions().emergencyLock();
    expect(mockDevice.current.emergencyLock).toHaveBeenCalled();
  });

  it("calls emergencyLock on demo account", () => {
    localStorage.setItem("myBotIs", "online");
    deviceActions().emergencyLock();
    expect(mockDevice.current.emergencyLock).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).not.toHaveBeenCalled();
    expect(demoLuaRunnerActions.eStop).toHaveBeenCalled();
  });

  it("calls emergencyUnlock", () => {
    window.confirm = () => true;
    deviceActions().emergencyUnlock();
    expect(mockDevice.current.emergencyUnlock).toHaveBeenCalled();
  });

  it("calls emergencyUnlock on demo account", () => {
    window.confirm = () => true;
    localStorage.setItem("myBotIs", "online");
    deviceActions().emergencyUnlock();
    expect(mockDevice.current.emergencyUnlock).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("emergency_unlock()");
  });

  it("doesn't call emergencyUnlock", () => {
    window.confirm = () => false;
    deviceActions().emergencyUnlock();
    expect(mockDevice.current.emergencyUnlock).not.toHaveBeenCalled();
  });

  it("forces emergencyUnlock", () => {
    window.confirm = () => false;
    deviceActions().emergencyUnlock(true);
    expect(mockDevice.current.emergencyUnlock).toHaveBeenCalled();
  });
});

describe("sync()", () => {
  it("calls sync", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "999.0.0";
    deviceActions().sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).toHaveBeenCalled();
  });

  it("calls badVersion", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = "1.0.0";
    deviceActions().sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).not.toHaveBeenCalled();
    expectBadVersionCall();
  });

  it("doesn't call sync: disconnected", () => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = undefined;
    deviceActions().sync()(jest.fn(), () => state);
    expect(mockDevice.current.sync).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("FarmBot is not connected.", {
      title: "Disconnected", color: "red",
    });
  });
});

describe("execSequence()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("handles normal errors", () => {
    const errorThrower: DeepPartial<Farmbot> = {
      execSequence: jest.fn(() => Promise.reject(new Error("yolo")))
    };

    replaceDeviceWith(errorThrower, async () => {
      await deviceActions().execSequence(1, []);
      expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, []);
      expect(error).toHaveBeenCalledWith("yolo");
    });
  });

  it("handles unexpected errors", async () => {
    const errorThrower: DeepPartial<Farmbot> = {
      execSequence: jest.fn(() => Promise.reject("unexpected"))
    };

    await replaceDeviceWith(errorThrower, async () => {
      await deviceActions().execSequence(22, []);
      expect(mockDevice.current.execSequence).toHaveBeenCalledWith(22, []);
      expect(error).toHaveBeenCalledWith("Sequence execution failed");
    });
  });

  it("calls execSequence", async () => {
    await deviceActions().execSequence(1);
    expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, undefined);
    expect(success).toHaveBeenCalled();
  });

  it("calls execSequence with variables", async () => {
    await deviceActions().execSequence(1, []);
    expect(mockDevice.current.execSequence).toHaveBeenCalledWith(1, []);
    expect(success).toHaveBeenCalled();
  });

  it("calls execSequence on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().execSequence(1);
    expect(mockDevice.current.execSequence).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoSequence).toHaveBeenCalledWith(
      expect.any(Object),
      1,
      undefined);
  });

  it("implodes when executing unsaved sequences", () => {
    expect(() => deviceActions().execSequence(undefined)).toThrow();
    expect(mockDevice.current.execSequence).not.toHaveBeenCalled();
  });
});

describe("takePhoto()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls takePhoto", async () => {
    await deviceActions().takePhoto();
    expect(mockDevice.current.takePhoto).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(Content.PROCESSING_PHOTO,
      { title: "Request sent" });
    expect(error).not.toHaveBeenCalled();
  });

  it("calls takePhoto on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().takePhoto();
    expect(mockDevice.current.takePhoto).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("take_photo()");
  });

  it("calls takePhoto: error", async () => {
    mockDevice.current.takePhoto = jest.fn(() => Promise.reject("error"));
    await deviceActions().takePhoto();
    await expect(mockDevice.current.takePhoto).toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Error taking photo");
  });
});

describe("MCUFactoryReset()", () => {
  it("doesn't call resetMCU", () => {
    window.confirm = () => false;
    deviceActions().MCUFactoryReset();
    expect(mockDevice.current.resetMCU).not.toHaveBeenCalled();
  });

  it("calls resetMCU", () => {
    window.confirm = () => true;
    deviceActions().MCUFactoryReset();
    expect(mockDevice.current.resetMCU).toHaveBeenCalled();
  });
});

describe("settingToggle()", () => {
  it("toggles mcu param via FirmwareConfig", () => {
    const sourceSetting = () => ({ value: 1, consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    deviceActions().settingToggle(
      "param_mov_nr_retry", sourceSetting)(jest.fn(), () => state);
    expect(editSpy).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: 0 });
    expect(saveSpy).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("toggles mcu param on", () => {
    const sourceSetting = () => ({ value: 0, consistent: true });
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    state.resources = buildResourceIndex([fakeConfig]);
    deviceActions().settingToggle(
      "param_mov_nr_retry", sourceSetting)(jest.fn(), () => state);
    expect(editSpy).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: 1 });
    expect(saveSpy).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("displays an alert message", () => {
    window.alert = jest.fn();
    const msg = "this is an alert.";
    deviceActions().settingToggle(
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
    deviceActions().updateMCU("param_mov_nr_retry", "0")(jest.fn(), () => state);
    expect(editSpy).toHaveBeenCalledWith(fakeConfig, { param_mov_nr_retry: "0" });
    expect(saveSpy).toHaveBeenCalledWith(fakeConfig.uuid);
    expect(warning).not.toHaveBeenCalled();
  });

  it("handles missing FirmwareConfig", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    deviceActions().updateMCU("param_mov_nr_retry", "0")(jest.fn(), () => state);
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
  });

  it("prevents update with incompatible value", () => {
    const state = fakeState();
    const fakeConfig = fakeFirmwareConfig();
    fakeConfig.body.movement_max_spd_x = 0;
    state.resources = buildResourceIndex([fakeConfig]);
    deviceActions().updateMCU("movement_min_spd_x", "100")(jest.fn(), () => state);
    expect(warning).toHaveBeenCalledWith(
      "Minimum speed should always be lower than maximum");
  });
});

describe("moveRelative()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls moveRelative", async () => {
    await deviceActions().moveRelative({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveRelative)
      .toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("calls moveRelative on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().moveRelative({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveRelative).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("move_relative(1, 0, 0)");
  });

  it("shows lock message", () => {
    mockState.bot.hardware.informational_settings.locked = true;
    deviceActions().moveRelative({ x: 1, y: 0, z: 0 });
    expect(error).toHaveBeenCalledWith("Command not available while locked.",
      { title: "Emergency stop active" });
    mockState.bot.hardware.informational_settings.locked = false;
  });
});

describe("moveAbsolute()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls moveAbsolute", async () => {
    await deviceActions().moveAbsolute({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveAbsolute)
      .toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls moveAbsolute on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().moveAbsolute({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.moveAbsolute).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("move_absolute(1, 0, 0)");
  });
});

describe("move()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  const BODY = [{
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
  }];

  it("calls move", async () => {
    await deviceActions().move({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: BODY,
        }],
      });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls move with speed", async () => {
    await deviceActions().move({ x: 1, y: 0, z: 0, speed: 50 });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: [
            ...BODY,
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
    await deviceActions().move({ x: 1, y: 0, z: 0, safeZ: true });
    expect(mockDevice.current.send)
      .toHaveBeenCalledWith({
        kind: "rpc_request",
        args: { label: expect.any(String), priority: expect.any(Number) },
        body: [{
          kind: "move",
          args: {},
          body: [
            ...BODY,
            { kind: "safe_z", args: {} }]
        }],
      });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls move on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().move({ x: 1, y: 0, z: 0 });
    expect(mockDevice.current.send).not.toHaveBeenCalled();
    expect(demoLuaRunner.csToLua).toHaveBeenCalledWith({
      kind: "move",
      args: {},
      body: BODY,
    });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("pinToggle()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls togglePin", async () => {
    await deviceActions().pinToggle(5);
    expect(mockDevice.current.togglePin).toHaveBeenCalledWith({ pin_number: 5 });
    expect(success).not.toHaveBeenCalled();
  });

  it("toggles demo account pin", () => {
    localStorage.setItem("myBotIs", "online");
    deviceActions().pinToggle(5);
    expect(mockDevice.current.togglePin).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("toggle_pin(5)");
  });
});

describe("readPin()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls readPin", async () => {
    await deviceActions().readPin(1, "label", 0);
    expect(mockDevice.current.readPin).toHaveBeenCalledWith({
      pin_number: 1, label: "label", pin_mode: 0,
    });
    expect(success).not.toHaveBeenCalled();
  });

  it("reads demo account pin", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().readPin(1, "label", 0);
    expect(mockDevice.current.readPin).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("read_pin(1)");
  });
});

describe("writePin()", () => {
  it("calls writePin", async () => {
    await deviceActions().writePin(1, 1, 0);
    expect(mockDevice.current.writePin).toHaveBeenCalledWith({
      pin_number: 1, pin_value: 1, pin_mode: 0,
    });
    expect(success).not.toHaveBeenCalled();
  });
});

describe("moveToHome()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls home", async () => {
    await deviceActions().moveToHome("x");
    expect(mockDevice.current.home)
      .toHaveBeenCalledWith({ axis: "x", speed: 100 });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls home on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().moveToHome("x");
    expect(mockDevice.current.home).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("go_to_home(\"x\")");
  });
});

describe("findHome()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls find_home", async () => {
    await deviceActions().findHome("all");
    expect(mockDevice.current.findHome)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls find_home on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().findHome("all");
    expect(mockDevice.current.findHome).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("find_home(\"all\")");
  });
});

describe("findAxisLength()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("calls find_axis_length", async () => {
    await deviceActions().findAxisLength("x");
    expect(mockDevice.current.calibrate)
      .toHaveBeenCalledWith({ axis: "x" });
    expect(success).not.toHaveBeenCalled();
  });

  it("calls find_home on demo accounts", async () => {
    localStorage.setItem("myBotIs", "online");
    await deviceActions().findAxisLength("x");
    expect(mockDevice.current.calibrate).not.toHaveBeenCalled();
    expect(demoLuaRunner.runDemoLuaCode).toHaveBeenCalledWith("find_axis_length(\"x\")");
  });
});

describe("isLog()", () => {
  it("knows if it is a log or not", () => {
    expect(deviceActions().isLog({})).toBe(false);
    expect(deviceActions().isLog({ message: "foo" })).toBe(true);
  });

  it("filters sensitive logs", () => {
    const log = { message: "NERVESPSKWPASSWORD" };
    console.error = jest.fn();
    const result = deviceActions().isLog(log);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Refusing to display log"));
  });
});

describe("commandErr()", () => {
  it("sends toast", () => {
    deviceActions().commandErr()();
    expect(error).toHaveBeenCalledWith("Command failed");
  });
});

describe("commandOK()", () => {
  afterEach(() => {
    localStorage.removeItem("myBotIs");
  });

  it("sends toast", () => {
    deviceActions().commandOK()();
    expect(success).toHaveBeenCalledWith(
      "Command request sent to device.",
      { title: "Request sent" });
  });

  it("sends demo account toast", () => {
    localStorage.setItem("myBotIs", "online");
    deviceActions().commandOK()();
    expect(success).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(
      "Sorry, that feature is unavailable in demo accounts.",
      { title: "Unavailable" });
  });
});

describe("changeStepSize()", () => {
  it("returns a redux action", () => {
    const payload = 23;
    const result = deviceActions().changeStepSize(payload);
    expect(result.type).toBe(Actions.CHANGE_STEP_SIZE);
    expect(result.payload).toBe(payload);
  });
});

describe("fetchMinOsFeatureData()", () => {
  const EXPECTED_URL = expect.stringContaining("FEATURE_MIN_VERSIONS.json");
  beforeEach(() => {
    (axios as unknown as { get: Function }).get = jest.fn(() => mockGet);
  });

  it("fetches min OS feature data: empty", async () => {
    mockGet = Promise.resolve({ data: {} });
    const dispatch = jest.fn();
    await deviceActions().fetchMinOsFeatureData()(dispatch);
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
    await deviceActions().fetchMinOsFeatureData()(dispatch);
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
    await deviceActions().fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("\"bad\""));
  });

  it("fetches bad min OS feature data", async () => {
    mockGet = Promise.resolve({ data: { a: "0", b: 0 } });
    const dispatch = jest.fn();
    console.log = jest.fn();
    await deviceActions().fetchMinOsFeatureData()(dispatch);
    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("{\"a\":\"0\",\"b\":0}"));
  });

  it("fails to fetch min OS feature data", async () => {
    mockGet = Promise.reject("error");
    const dispatch = jest.fn();
    await deviceActions().fetchMinOsFeatureData()(dispatch);
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
  beforeEach(() => {
    (axios as unknown as { get: Function }).get = jest.fn(() => mockGet);
  });

  it("fetches OS release notes", async () => {
    mockGet = Promise.resolve({
      data: "intro\n\n# v6\n\n* note"
    });
    const dispatch = jest.fn();
    await deviceActions().fetchOsReleaseNotes()(dispatch);
    await expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL);
    expect(dispatch).toHaveBeenCalledWith({
      payload: "intro\n\n# v6\n\n* note",
      type: Actions.FETCH_OS_RELEASE_NOTES_OK
    });
  });

  it("errors while fetching OS release notes", async () => {
    mockGet = Promise.reject({ error: "" });
    const dispatch = jest.fn();
    await deviceActions().fetchOsReleaseNotes()(dispatch);
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
    deviceActions().updateConfig({ os_auto_update: true })(jest.fn(), () => state);
    expect(editSpy).toHaveBeenCalledWith(fakeConfig, { os_auto_update: true });
    expect(saveSpy).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("doesn't update FbosConfig", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    deviceActions().updateConfig({ os_auto_update: true })(jest.fn(), () => state);
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });
});

const expectBadVersionCall = (noDismiss = true) => {
  expect(error).toHaveBeenCalledWith(expect.stringContaining("old version"), {
    title: "Please Update",
    noTimer: true,
    redirect: Path.settings("farmbot_os"),
    noDismiss,
    idPrefix: "EOL",
  });
};

describe("badVersion()", () => {
  it("warns of old FBOS version", () => {
    deviceActions().badVersion();
    expectBadVersionCall();
  });

  it("warns of old FBOS version: dismiss-able", () => {
    deviceActions().badVersion({ noDismiss: false });
    expectBadVersionCall(false);
  });
});
