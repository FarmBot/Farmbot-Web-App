const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
  powerOff: jest.fn(() => { return Promise.resolve(); }),
  reboot: jest.fn(() => { return Promise.resolve(); }),
  checkArduinoUpdates: jest.fn(() => { return Promise.resolve(); }),
  emergencyLock: jest.fn(() => { return Promise.resolve(); }),
  emergencyUnlock: jest.fn(() => { return Promise.resolve(); }),
  execSequence: jest.fn(() => { return Promise.resolve(); }),
  resetMCU: jest.fn(),
  updateMcu: jest.fn(() => { return Promise.resolve(); }),
  togglePin: jest.fn(() => { return Promise.resolve(); }),
  home: jest.fn(() => { return Promise.resolve(); }),
  sync: jest.fn(() => { return Promise.resolve(); }),
  readStatus: jest.fn(() => Promise.resolve())
};

jest.mock("../../device", () => ({
  getDevice: () => {
    return mockDevice;
  }
}));
const mockOk = jest.fn();
const mockInfo = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk, info: mockInfo }));

import * as actions from "../actions";
import { getDevice } from "../../device";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { setSyncStatus, changeStepSize, resetNetwork, resetConnectionInfo } from "../actions";
import { SyncStatus } from "farmbot";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { refresh } from "../../api/crud";

describe("checkControllerUpdates()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls checkUpdates", async () => {
    const { mock } = getDevice().checkUpdates as jest.Mock<{}>;
    await actions.checkControllerUpdates();
    expect(mock.calls.length).toEqual(1);
    expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("powerOff()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls powerOff", async () => {
    const { mock } = getDevice().powerOff as jest.Mock<{}>;
    await actions.powerOff();
    expect(mock.calls.length).toEqual(1);
    expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("reboot()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls reboot", async () => {
    const { mock } = getDevice().reboot as jest.Mock<{}>;
    await actions.reboot();
    expect(mock.calls.length).toEqual(1);
    expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("emergencyLock() / emergencyUnlock", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls emergencyLock", () => {
    const { mock } = getDevice().emergencyLock as jest.Mock<{}>;
    actions.emergencyLock();
    expect(mock.calls.length).toEqual(1);
  });

  it("calls emergencyUnlock", () => {
    const { mock } = getDevice().emergencyUnlock as jest.Mock<{}>;
    window.confirm = jest.fn(() => true);
    actions.emergencyUnlock();
    expect(mock.calls.length).toEqual(1);
  });
});

describe("sync()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("doesn't call sync: disconnected", () => {
    const { mock } = getDevice().sync as jest.Mock<{}>;
    const getState = () => fakeState();
    actions.sync()(jest.fn(), getState);
    expect(mock.calls.length).toEqual(0);
    const expectedMessage = ["FarmBot is not connected.", "Disconnected", "red"];
    expect(mockInfo).toBeCalledWith(...expectedMessage);
  });
});

describe("execSequence()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls execSequence", async () => {
    const { mock } = getDevice().execSequence as jest.Mock<{}>;
    const s = fakeSequence().body;
    await actions.execSequence(s);
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual(s.id);
    expect(mockOk.mock.calls.length).toEqual(1);
  });

  it("implodes when executing unsaved sequences", () => {
    const { mock } = getDevice().execSequence as jest.Mock<{}>;
    const ok = fakeSequence().body;
    ok.id = undefined;
    expect(() => actions.execSequence(ok)).toThrow();
    expect(mock.calls.length).toEqual(0);
  });
});

describe("MCUFactoryReset()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls resetMCU", () => {
    const { mock } = getDevice().resetMCU as jest.Mock<{}>;
    actions.MCUFactoryReset();
    expect(mock.calls.length).toEqual(1);
  });
});

describe("botConfigChange()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls updateMcu", async () => {
    const { mock } = getDevice().updateMcu as jest.Mock<{}>;
    await actions.botConfigChange("encoder_enabled_x", 0);
    expect(mock.calls.length).toEqual(1);
    expect(mock.calls[0][0]).toEqual({ "encoder_enabled_x": 0 });
    expect(mockOk.mock.calls.length).toEqual(0);
  });
});

describe("pinToggle()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls togglePin", async () => {
    const { mock } = getDevice().togglePin as jest.Mock<{}>;
    await actions.pinToggle(5);
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0].pin_number).toEqual(5);
    expect(mockOk.mock.calls.length).toEqual(0);
  });
});

describe("homeAll()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls home", async () => {
    const { mock } = getDevice().home as jest.Mock<{}>;
    await actions.homeAll(100);
    expect(mock.calls.length).toEqual(1);
    const argList = mock.calls[0];
    expect(argList[0].axis).toEqual("all");
    expect(argList[0].speed).toEqual(100);
    expect(mockOk.mock.calls.length).toEqual(1);
  });
});

describe("isLog()", function () {
  it("knows if it is a log or not", () => {
    expect(actions.isLog({})).toBe(false);
    expect(actions.isLog({ message: "foo" })).toBe(true);
  });
});

describe("toggleControlPanel()", function () {
  it("toggles", () => {
    const action = actions.toggleControlPanel("homing_and_calibration");
    expect(action.payload).toEqual("homing_and_calibration");
  });
});

describe("setSyncStatus()", () => {
  it("returns a redux action", () => {
    const payload: SyncStatus = "locked";
    const result = setSyncStatus(payload);
    expect(result.type).toBe(Actions.SET_SYNC_STATUS);
    expect(result.payload).toBe(payload);
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
    const d = fakeDevice();
    resetConnectionInfo(d)(mock1, jest.fn());
    expect(mock1).toHaveBeenCalledWith(resetNetwork());
    expect(mock1).toHaveBeenCalledWith(resetNetwork());
    expect(mockDevice.readStatus).toHaveBeenCalled();
  });
});
