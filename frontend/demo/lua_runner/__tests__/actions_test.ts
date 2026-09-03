import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig,
  fakeFarmwareEnv,
  fakeFirmwareConfig,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);
let mockLocked = false;
let mockBotPosition = { x: 0, y: 0, z: 0 };

import { TOAST_OPTIONS } from "../../../toast/constants";
import { Actions } from "../../../constants";
import { error, info } from "../../../toast/toast";
import { store } from "../../../redux/store";
import {
  eStop, expandActions, runActions, runDemoMovementCommand, setCurrent,
} from "../actions";
import * as lodash from "lodash";
import {
  getDemoMovementTarget,
  getDemoMovementStopVersion,
  registerDemoMovementDriver,
  reportDemoMovementComplete,
  reportDemoMovementPosition,
} from "../movement";

const originalDispatch = store.dispatch;
const originalGetState = store.getState;
const mockDispatch = jest.fn();
let randomSpy: jest.SpyInstance;
const mockGetState = () => ({
  resources: mockResources,
  bot: {
    hardware: {
      location_data: { position: mockBotPosition },
      informational_settings: { locked: mockLocked },
    },
  },
});

describe("runActions()", () => {
  let unregisterMovementDriver: (() => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    randomSpy = jest.spyOn(lodash, "random").mockReturnValue(0);
    console.log = jest.fn();
    mockLocked = false;
    mockBotPosition = { x: 0, y: 0, z: 0 };
    mockResources = buildResourceIndex([
      fakeFirmwareConfig(),
      fakeFbosConfig(),
      fakeWebAppConfig(),
    ]);
    sessionStorage.removeItem("soilSurfaceTriangles");
    (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
    (store as unknown as { getState: Function }).getState = mockGetState;
    eStop();
    mockDispatch.mockClear();
    unregisterMovementDriver = undefined;
  });

  afterEach(() => {
    unregisterMovementDriver?.();
    eStop();
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

  it("shows an error for invalid message types", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "send_message", args: ["nope", "Hello, world!", "toast", "{}"] },
      ],
    );
    jest.runAllTimers();
    expect(error).toHaveBeenCalledWith("Invalid message type: nope");
    expect(info).not.toHaveBeenCalled();
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

  it("waits for the movement callback before continuing", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });
    runActions([
      { type: "busy", args: [1] },
      { type: "animated_move_absolute", args: [100, 0, 0] },
      { type: "busy", args: [0] },
    ]);

    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 0, z: 0 });
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });

    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
  });

  it("runs direct movement commands through the existing queue", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });

    runDemoMovementCommand({
      type: "move_relative",
      position: { x: 100, y: 0, z: 0 },
    });
    jest.runAllTimers();

    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 0, z: 0 });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: true,
    });
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });

    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
  });

  it("serializes direct movement commands with queued actions", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });
    runActions([
      { type: "animated_move_absolute", args: [100, 0, 0] },
    ]);
    runDemoMovementCommand({
      type: "move_absolute",
      position: { x: 200, y: 0, z: 0 },
    });

    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 0, z: 0 });
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 200, y: 0, z: 0 });
    reportDemoMovementComplete({ x: 200, y: 0, z: 0 });
    jest.runAllTimers();
  });

  it("runs direct all-axis homing in Z, Y, X order", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    mockBotPosition = { x: 100, y: 200, z: 300 };
    reportDemoMovementPosition(mockBotPosition);

    runDemoMovementCommand({ type: "find_home", axis: "all" });
    jest.runAllTimers();

    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 200, z: 0 });
    reportDemoMovementComplete({ x: 100, y: 200, z: 0 });
    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 0, z: 0 });
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 0, y: 0, z: 0 });
    reportDemoMovementComplete({ x: 0, y: 0, z: 0 });
    jest.runAllTimers();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
  });

  it("runs a direct single-axis Go Home command", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    mockBotPosition = { x: 100, y: 200, z: 300 };
    reportDemoMovementPosition(mockBotPosition);

    runDemoMovementCommand({ type: "go_to_home", axis: "y" });
    jest.runAllTimers();

    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 0, z: 300 });
    reportDemoMovementComplete({ x: 100, y: 0, z: 300 });
    jest.runAllTimers();
  });

  it("cancels remaining direct homing targets on E-stop", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    mockBotPosition = { x: 100, y: 200, z: 300 };
    reportDemoMovementPosition(mockBotPosition);
    runDemoMovementCommand({ type: "go_to_home", axis: "all" });
    jest.runAllTimers();

    expect(getDemoMovementTarget()).toEqual({ x: 100, y: 200, z: 0 });
    reportDemoMovementPosition({ x: 100, y: 200, z: 150 });
    eStop();
    reportDemoMovementComplete({ x: 100, y: 200, z: 0 });
    jest.runAllTimers();

    expect(getDemoMovementTarget()).toBeUndefined();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 100, y: 200, z: 150 },
    });
  });

  it("runs semantic movement targets one at a time", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });
    runActions([
      { type: "animated_move_absolute", args: [100, 0, 0] },
      { type: "animated_move_absolute", args: [200, 0, 0] },
    ]);

    jest.runAllTimers();
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 200, y: 0, z: 0 },
    });
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(getDemoMovementTarget()).toEqual({ x: 200, y: 0, z: 0 });
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 200, y: 0, z: 0 },
    });
    reportDemoMovementComplete({ x: 200, y: 0, z: 0 });
  });

  it("starts a wait only after the movement reaches its target", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });
    runActions([
      { type: "animated_move_absolute", args: [100, 0, 0] },
      { type: "wait_ms", args: [1000] },
      { type: "busy", args: [0] },
    ]);
    jest.runAllTimers();

    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.advanceTimersByTime(999);
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
    jest.advanceTimersByTime(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
  });

  it("freezes at the rendered position on emergency stop", () => {
    jest.useFakeTimers();
    unregisterMovementDriver = registerDemoMovementDriver();
    reportDemoMovementPosition({ x: 0, y: 0, z: 0 });
    runActions([
      { type: "animated_move_absolute", args: [100, 0, 0] },
      { type: "busy", args: [0] },
    ]);
    jest.runAllTimers();
    reportDemoMovementPosition({ x: 40, y: 0, z: 0 });
    const previousStopVersion = getDemoMovementStopVersion();

    eStop();
    expect(getDemoMovementStopVersion()).toEqual(previousStopVersion + 1);
    reportDemoMovementComplete({ x: 100, y: 0, z: 0 });
    jest.runAllTimers();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 40, y: 0, z: 0 },
    });
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: Actions.DEMO_SET_BUSY,
      payload: false,
    });
  });
});

describe("expandActions()", () => {
  const defaultMove = (x: number, y = 0, z = 0) => ({
    type: "animated_move_absolute",
    args: [x, y, z],
  });
  const defaultXAxisMovement = (target: number) => {
    return [
      { type: "busy", args: [1] },
      defaultMove(target),
      { type: "busy", args: [0] },
    ];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    randomSpy = jest.spyOn(lodash, "random").mockReturnValue(0);
    setCurrent({ x: 0, y: 0, z: 0 });
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

  it("expands an absolute movement to one target", () => {
    expect(expandActions([
      { type: "move_absolute", args: [300, 0, 0] },
    ], [])).toEqual(defaultXAxisMovement(300));
  });

  it("retains an already resolved animated movement", () => {
    expect(expandActions([
      { type: "animated_move_absolute", args: [100, 200, 0] },
    ], [])).toEqual([
      { type: "animated_move_absolute", args: [100, 200, 0] },
    ]);
  });

  it("expands an analog pin read", () => {
    randomSpy.mockReturnValue(1024);
    expect(expandActions([
      { type: "read_pin", args: [5] },
    ], [])).toEqual([
      { type: "sensor_reading", args: [5, 0, 0, 0] },
      { type: "write_pin", args: [5, "analog", 1024] },
    ]);
    expect(randomSpy).toHaveBeenCalledWith(0, 1024);
  });

  it("expands a relative movement to one target", () => {
    setCurrent({ x: 100, y: 200, z: 0 });
    expect(expandActions([
      { type: "move_relative", args: [25, 25, 0] },
    ], [])).toEqual([
      { type: "busy", args: [1] },
      defaultMove(125, 225, 0),
      { type: "busy", args: [0] },
    ]);
  });

  it("preserves ordered homing targets", () => {
    setCurrent({ x: 100, y: 200, z: 300 });
    expect(expandActions([
      { type: "find_home", args: ["all"] },
    ], [])).toEqual([
      { type: "busy", args: [1] },
      defaultMove(100, 200, 0),
      defaultMove(100, 0, 0),
      defaultMove(0, 0, 0),
      { type: "busy", args: [0] },
    ]);
  });

  it("preserves computed axis-order submoves", () => {
    const moveItems = JSON.stringify([
      {
        kind: "axis_overwrite",
        args: {
          axis: "all",
          axis_operand: {
            kind: "coordinate",
            args: { x: 100, y: 200, z: -300 },
          },
        },
      },
      {
        kind: "axis_order",
        args: { grouping: "x,y,z", route: "in_order" },
      },
    ]);
    expect(expandActions([
      { type: "_move", args: [moveItems] },
    ], [])).toEqual([
      { type: "busy", args: [1] },
      defaultMove(100, 0, 0),
      defaultMove(100, 200, 0),
      defaultMove(100, 200, -300),
      { type: "busy", args: [0] },
    ]);
  });

  it("expands a move with its captured variables", () => {
    const moveItems = JSON.stringify([{
      kind: "axis_overwrite",
      args: {
        axis: "all",
        axis_operand: {
          kind: "identifier",
          args: { label: "Location" },
        },
      },
    }]);
    expect(expandActions([{
      type: "_move",
      args: [moveItems],
      variables: [{
        kind: "parameter_application",
        args: {
          label: "Location",
          data_value: {
            kind: "coordinate",
            args: { x: 100, y: 200, z: -300 },
          },
        },
      }],
    }], [])).toEqual([
      { type: "busy", args: [1] },
      defaultMove(100, 200, -300),
      { type: "busy", args: [0] },
    ]);
  });

  it("expands movement warnings", () => {
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
      { type: "busy", args: [1] },
      { type: "animated_move_absolute", args: [0, 0, 0] },
      { type: "busy", args: [0] },
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

  it("doesn't re-expand take_photo", () => {
    const expanded = expandActions([
      { type: "take_photo", args: [] },
    ], []);
    expect(expandActions(expanded, [])).toEqual(expanded);
  });

  it("doesn't replace resolved message positions", () => {
    setCurrent({ x: 0, y: 0, z: 0 });
    const expanded = expandActions([
      { type: "send_message", args: ["info", "message", "toast"] },
      { type: "move_absolute", args: [100, 0, 0] },
    ], []);
    setCurrent({ x: 100, y: 0, z: 0 });
    expect(expandActions(expanded, [])).toEqual(expanded);
  });

  it("replaces invalid resolved message positions", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    expect(expandActions([{
      type: "send_message",
      args: ["info", "message", "toast", "{"],
    }], [])).toEqual([{
      type: "send_message",
      args: ["info", "message", "toast", "{\"x\":1,\"y\":2,\"z\":3}"],
    }]);
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
      { type: "wait_ms", args: [3000] },
      {
        type: "send_message",
        args: [
          "success",
          "Camera calibration complete.",
          "toast",
          "{\"x\":0,\"y\":0,\"z\":0}",
          3,
        ],
      },
    ]);
  });

  it("expands detect_weeds", () => {
    const useBounds = fakeFarmwareEnv();
    useBounds.body.key = "WEED_DETECTOR_use_bounds";
    useBounds.body.value = "\"FALSE\"";
    mockResources = buildResourceIndex([
      fakeFirmwareConfig(),
      fakeFbosConfig(),
      fakeWebAppConfig(),
      useBounds,
    ]);
    randomSpy.mockReset()
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(-240)
      .mockReturnValueOnce(-320)
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(240)
      .mockReturnValueOnce(320)
      .mockReturnValueOnce(30);
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
      { type: "wait_ms", args: [3000] },
      {
        type: "create_point",
        args: [JSON.stringify({
          name: "Weed",
          pointer_type: "Weed",
          x: -240,
          y: -320,
          z: -500,
          meta: { color: "red", created_by: "plant-detection" },
          radius: 10,
          plant_stage: "pending",
        })],
      },
      {
        type: "create_point",
        args: [JSON.stringify({
          name: "Weed",
          pointer_type: "Weed",
          x: 240,
          y: 320,
          z: -500,
          meta: { color: "red", created_by: "plant-detection" },
          radius: 30,
          plant_stage: "pending",
        })],
      },
    ]);
    expect(randomSpy.mock.calls).toEqual([
      [2, 5],
      [-240, 240],
      [-320, 320],
      [10, 30],
      [-240, 240],
      [-320, 320],
      [10, 30],
    ]);
  });

  it("keeps detected weeds inside garden bounds when configured", () => {
    randomSpy.mockReset()
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(240)
      .mockReturnValueOnce(320)
      .mockReturnValueOnce(30);
    const weeds = expandActions([
      { type: "detect_weeds", args: [] },
    ], []).filter(action => action.type == "create_point");
    expect(weeds.map(weed => JSON.parse("" + weed.args[0])))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ x: 0, y: 0 }),
        expect.objectContaining({ x: 240, y: 320 }),
      ]));
    expect(randomSpy.mock.calls).toEqual([
      [2, 5],
      [0, 240],
      [0, 320],
      [10, 30],
      [0, 240],
      [0, 320],
      [10, 30],
    ]);
  });

  it("expands measure_soil_height", () => {
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.soil_height = -425;
    mockResources = buildResourceIndex([fbosConfig]);
    randomSpy.mockReturnValue(50);
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
      { type: "wait_ms", args: [3000] },
      {
        type: "create_point",
        args: [JSON.stringify({
          name: "Soil Height",
          pointer_type: "GenericPointer",
          x: 0,
          y: 0,
          z: -375,
          meta: { at_soil_level: "true" },
          radius: 0,
        })],
      },
    ]);
    expect(randomSpy).toHaveBeenCalledWith(-50, 50);

    fbosConfig.body.soil_height = undefined;
    mockResources = buildResourceIndex([fbosConfig]);
    randomSpy.mockReturnValue(0);
    const fallback = expandActions([
      { type: "measure_soil_height", args: [] },
    ], []).find(action => action.type == "create_point");
    expect(JSON.parse("" + fallback?.args[0]).z).toEqual(-500);
  });
});

afterAll(() => {
  (store as unknown as { dispatch: Function }).dispatch = originalDispatch;
  (store as unknown as { getState: Function }).getState = originalGetState;
});
