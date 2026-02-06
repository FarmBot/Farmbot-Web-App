jest.unmock("../actions");

import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);
let mockLocked = false;

import { TOAST_OPTIONS } from "../../../toast/constants";
import { info } from "../../../toast/toast";
import { store } from "../../../redux/store";
import { eStop, expandActions, runActions, setCurrent } from "../actions";
import * as lodash from "lodash";

const originalDispatch = store.dispatch;
const originalGetState = store.getState;
const mockDispatch = jest.fn();
let randomSpy: jest.SpyInstance;
const mockGetState = () => ({
  resources: mockResources,
  bot: {
    hardware: {
      location_data: { position: { x: 0, y: 0, z: 0 } },
      informational_settings: { locked: mockLocked },
    },
  },
});

describe("runActions()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    randomSpy = jest.spyOn(lodash, "random").mockReturnValue(0);
    console.log = jest.fn();
    mockLocked = false;
    (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
    (store as unknown as { getState: Function }).getState = mockGetState;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it("runs actions", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "send_message", args: ["info", "Hello, world!", "toast", "{}"] },
      ],
    );
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("Hello, world!", TOAST_OPTIONS().info);
  });

  it("runs actions: missing", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "wait_ms", args: [10000] },
        { type: "send_message", args: ["info", "Hello, world!", "toast", "{}"] },
      ],
    );
    eStop();
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
  });

  it("runs actions: eStop only notifies once", () => {
    mockLocked = true;
    jest.useFakeTimers();
    runActions(
      [
        { type: "wait_ms", args: [1000] },
        { type: "wait_ms", args: [1000] },
        { type: "wait_ms", args: [1000] },
      ],
    );
    jest.runAllTimers();
    expect(info).toHaveBeenCalledTimes(1);
  });
});

describe("expandActions()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    randomSpy = jest.spyOn(lodash, "random").mockReturnValue(0);
    setCurrent({ x: 0, y: 0, z: 0 });
    localStorage.removeItem("timeStepMs");
    localStorage.removeItem("mmPerSecond");
    console.log = jest.fn();
    mockResources = buildResourceIndex([
      fakeFirmwareConfig(),
      fakeFbosConfig(),
      fakeWebAppConfig(),
    ]);
    mockLocked = false;
    (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
    (store as unknown as { getState: Function }).getState = mockGetState;
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it("chunks movements: default", () => {
    expect(expandActions([
      { type: "move_absolute", args: [300, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [125, 0, 0] },
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [250, 0, 0] },
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [300, 0, 0] },
    ]);
  });

  it("chunks movements: lands on target", () => {
    expect(expandActions([
      { type: "move_absolute", args: [125, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [125, 0, 0] },
    ]);
  });

  it("chunks movements: custom", () => {
    localStorage.setItem("timeStepMs", "1000");
    localStorage.setItem("mmPerSecond", "1000");
    expect(expandActions([
      { type: "move_absolute", args: [300, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [1000] },
      { type: "expanded_move_absolute", args: [300, 0, 0] },
    ]);
  });

  it("doesn't chunk movements", () => {
    localStorage.setItem("DISABLE_CHUNKING", "true");
    expect(expandActions([
      { type: "move_absolute", args: [2000, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [2000, 0, 0] },
    ]);
  });

  it("chunks movements: warns", () => {
    expect(expandActions([
      { type: "_move", args: [JSON.stringify([{ kind: "foo", args: {} }])] },
    ], [])).toEqual([
      {
        type: "send_message",
        args: [
          "warn",
          "not yet supported: item kind: foo",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
        ],
      },
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [0, 0, 0] },
    ]);
  });

  it("expands take_photo", () => {
    expect(expandActions([
      { type: "take_photo", args: [] },
    ], [])).toEqual([
      {
        type: "send_message",
        args: [
          "info",
          "Taking photo",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      { type: "wait_ms", args: [2000] },
      { type: "take_photo", args: [0, 0, 0] },
      {
        type: "send_message",
        args: [
          "info",
          "Uploaded image:",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
    ]);
  });

  it("expands calibrate_camera", () => {
    expect(expandActions([
      { type: "calibrate_camera", args: [] },
    ], [])).toEqual([
      {
        type: "send_message",
        args: [
          "info",
          "Calibrating camera",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      { type: "wait_ms", args: [12000] },
      { type: "take_photo", args: [0, 0, 0] },
      {
        type: "send_message",
        args: [
          "info",
          "Uploaded image:",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
    ]);
  });

  it("expands detect_weeds", () => {
    expect(expandActions([
      { type: "detect_weeds", args: [] },
    ], [])).toEqual([
      {
        type: "send_message",
        args: [
          "info",
          "Running weed detector",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      { type: "wait_ms", args: [12000] },
      { type: "take_photo", args: [0, 0, 0] },
      {
        type: "send_message",
        args: [
          "info",
          "Uploaded image:",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      {
        type: "create_point",
        args: [JSON.stringify({
          name: "Weed",
          pointer_type: "Weed",
          x: 0,
          y: 0,
          z: -500,
          meta: { color: "red", created_by: "plant-detection" },
          radius: 50,
          plant_stage: "pending",
        })],
      },
    ]);
  });

  it("expands measure_soil_height", () => {
    expect(expandActions([
      { type: "measure_soil_height", args: [] },
    ], [])).toEqual([
      {
        type: "send_message",
        args: [
          "info",
          "Executing Measure Soil Height",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      { type: "wait_ms", args: [12000] },
      { type: "take_photo", args: [0, 0, 0] },
      {
        type: "send_message",
        args: [
          "info",
          "Uploaded image:",
          "",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
      {
        type: "create_point",
        args: [JSON.stringify({
          name: "Soil Height",
          pointer_type: "GenericPointer",
          x: 0,
          y: 0,
          z: -500,
          meta: { at_soil_level: "true" },
          radius: 0,
        })],
      },
    ]);
  });
});

afterAll(() => {
  (store as unknown as { dispatch: Function }).dispatch = originalDispatch;
  (store as unknown as { getState: Function }).getState = originalGetState;
});
