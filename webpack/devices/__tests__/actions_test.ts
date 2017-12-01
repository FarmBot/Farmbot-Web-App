const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
  powerOff: jest.fn(() => { return Promise.resolve(); }),
  resetOS: jest.fn(),
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
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { changeStepSize, resetNetwork, resetConnectionInfo } from "../actions";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

describe("checkControllerUpdates()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls checkUpdates", async () => {
    await actions.checkControllerUpdates();
    expect(mockDevice.checkUpdates).toHaveBeenCalled();
    expect(mockOk).toHaveBeenCalled();
  });
});

describe("powerOff()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls powerOff", async () => {
    await actions.powerOff();
    expect(mockDevice.powerOff).toHaveBeenCalled();
    expect(mockOk).toHaveBeenCalled();
  });
});

describe("factoryReset()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("doesn't call factoryReset", async () => {
    await actions.factoryReset();
    expect(mockDevice.resetOS).not.toHaveBeenCalled();
  });

  it("calls factoryReset", async () => {
    // tslint:disable-next-line:no-any
    (global as any).confirm = () => true;
    await actions.factoryReset();
    expect(mockDevice.resetOS).toHaveBeenCalled();
  });
});

describe("reboot()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls reboot", async () => {
    await actions.reboot();
    expect(mockDevice.reboot).toHaveBeenCalled();
    expect(mockOk).toHaveBeenCalled();
  });
});

describe("emergencyLock() / emergencyUnlock", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls emergencyLock", () => {
    actions.emergencyLock();
    expect(mockDevice.emergencyLock).toHaveBeenCalled();
  });

  it("calls emergencyUnlock", () => {
    window.confirm = jest.fn(() => true);
    actions.emergencyUnlock();
    expect(mockDevice.emergencyUnlock).toHaveBeenCalled();
  });
});

describe("sync()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("doesn't call sync: disconnected", () => {
    const getState = () => fakeState();
    actions.sync()(jest.fn(), getState);
    expect(mockDevice.sync).not.toHaveBeenCalled();
    const expectedMessage = ["FarmBot is not connected.", "Disconnected", "red"];
    expect(mockInfo).toBeCalledWith(...expectedMessage);
  });
});

describe("execSequence()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls execSequence", async () => {
    const s = fakeSequence().body;
    await actions.execSequence(s);
    expect(mockDevice.execSequence).toHaveBeenCalledWith(s.id);
    expect(mockOk).toHaveBeenCalled();
  });

  it("implodes when executing unsaved sequences", () => {
    const ok = fakeSequence().body;
    ok.id = undefined;
    expect(() => actions.execSequence(ok)).toThrow();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
  });
});

describe("MCUFactoryReset()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls resetMCU", () => {
    actions.MCUFactoryReset();
    expect(mockDevice.resetMCU).toHaveBeenCalled();
  });
});

describe("botConfigChange()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls updateMcu", async () => {
    await actions.botConfigChange("encoder_enabled_x", 0);
    expect(mockDevice.updateMcu).toHaveBeenCalledWith({ encoder_enabled_x: 0 });
    expect(mockOk).not.toHaveBeenCalled();
  });
});

describe("pinToggle()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls togglePin", async () => {
    await actions.pinToggle(5);
    expect(mockDevice.togglePin).toHaveBeenCalledWith({ pin_number: 5 });
    expect(mockOk).not.toHaveBeenCalled();
  });
});

describe("homeAll()", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("calls home", async () => {
    await actions.homeAll(100);
    expect(mockDevice.home)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
    expect(mockOk).toHaveBeenCalled();
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
    expect(mock1).toHaveBeenCalledTimes(2);
    expect(mockDevice.readStatus).toHaveBeenCalled();
  });
});
