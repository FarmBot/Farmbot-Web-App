jest.unmock("..");
jest.unmock("../actions");

import {
  buildResourceIndex,
  fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFirmwareConfig,
  fakeWebAppConfig,
  fakeFbosConfig,
  fakePoint,
  fakeSequence, fakeTool,
  fakeToolSlot,
  fakePointGroup,
  fakePlant,
  fakeWeed,
  fakeCurve,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);
let mockLocked = false;
let mockJobs: Record<string, unknown> = {};

import {
  Execute, FindHome, Move, ParameterApplication, TaggedSequence,
} from "farmbot";
import { Actions } from "../../../constants";
import { store } from "../../../redux/store";
import { error, info } from "../../../toast/toast";
import {
  collectDemoSequenceActions,
  csToLua,
  runDemoLuaCode,
  runDemoSequence,
} from "..";
import * as lodash from "lodash";
import { TOAST_OPTIONS } from "../../../toast/constants";
import * as crud from "../../../api/crud";
import { setCurrent } from "../actions";
import { API } from "../../../api";

API.setBaseUrl("");

let edit: jest.SpyInstance;
let init: jest.SpyInstance;
let initSave: jest.SpyInstance;
let save: jest.SpyInstance;
let randomSpy: jest.SpyInstance;
const originalDispatch = store.dispatch;
const originalGetState = store.getState;
const mockDispatch = jest.fn();
const mockGetState = () => ({
  resources: mockResources,
  bot: {
    hardware: {
      informational_settings: { locked: mockLocked },
      jobs: mockJobs,
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  randomSpy = jest.spyOn(lodash, "random").mockReturnValue(0);
  mockResources = buildResourceIndex([]);
  mockLocked = false;
  mockJobs = {};
  (store as unknown as { dispatch: Function }).dispatch = mockDispatch;
  (store as unknown as { getState: Function }).getState = mockGetState;
  edit = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  save = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  initSave = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  init = jest.spyOn(crud, "init")
    .mockImplementation(() => ({ payload: { uuid: "" } } as never));
});

afterEach(() => {
  randomSpy.mockRestore();
  edit.mockRestore();
  init.mockRestore();
  initSave.mockRestore();
  save.mockRestore();
  jest.useRealTimers();
});

afterAll(() => {
  (store as unknown as { dispatch: Function }).dispatch = originalDispatch;
  (store as unknown as { getState: Function }).getState = originalGetState;
});

describe("runDemoSequence()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    console.log = jest.fn();
    jest.useFakeTimers();
    setCurrent({ x: 0, y: 0, z: 0 });
  });

  it("runs sequence with number variable", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Number\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Number",
        data_value: { kind: "numeric", args: { number: 1 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
  });

  it("runs sequence with text variable", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Text\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Text",
        data_value: { kind: "text", args: { string: "text" } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("text");
  });

  it("runs sequence with coordinate variable", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Location\").x)" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
  });

  it("runs sequence with point variable", () => {
    const point = fakePoint();
    point.body.id = 1;
    point.body.x = 0;
    mockResources = buildResourceIndex([point]);
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Location\").x)" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: {
          kind: "point",
          args: { pointer_id: 1, pointer_type: "GenericPointer" },
        },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
  });

  it("runs sequence with point variable: no points", () => {
    mockResources = buildResourceIndex([]);
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Location\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: {
          kind: "point",
          args: { pointer_id: 1, pointer_type: "GenericPointer" },
        },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("undefined");
  });

  it("runs sequence with tool variable", () => {
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    mockResources = buildResourceIndex([slot]);
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Location\").tool_id)" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: { kind: "tool", args: { tool_id: 1 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
  });

  it("runs sequence with tool variable: not tools", () => {
    mockResources = buildResourceIndex([]);
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Location\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: { kind: "tool", args: { tool_id: 1 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("undefined");
  });

  it("runs sequence with point group variable", () => {
    const point1 = fakePoint();
    point1.body.id = 1;
    const point2 = fakePoint();
    point2.body.id = 2;
    const point3 = fakePoint();
    point3.body.id = 3;
    const group = fakePointGroup();
    group.body.id = 1;
    group.body.point_ids = [1, 2, 3];
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{
      kind: "send_message",
      args: { message: "text", message_type: "info" },
    }];
    const ri = buildResourceIndex([
      group, point1, point2, point3, sequence,
    ]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: { kind: "point_group", args: { point_group_id: 1 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledTimes(3);
    expect(init).toHaveBeenCalledWith("Log", {
      message: "text",
      type: "info",
      channels: ["undefined"],
      verbosity: undefined,
      x: 0,
      y: 0,
      z: 0,
    });
  });

  it("runs sequence with other variable", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Other\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Other",
        data_value: { kind: "identifier", args: { label: "var" } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "Variable \"Other\" of type identifier not implemented.",
      type: "error",
      channels: ["undefined"],
      verbosity: undefined,
      x: 0,
      y: 0,
      z: 0,
    });
    expect(console.log).toHaveBeenCalledWith("undefined");
    expect(error).not.toHaveBeenCalled();
  });

  it("runs non-lua sequence step", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "send_message",
      args: { message: "text", message_type: "info" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, []);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "text",
      type: "info",
      channels: ["undefined"],
      verbosity: undefined,
      x: 0,
      y: 0,
      z: 0,
    });
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("runs move sequence step", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    const sequence = fakeSequence();
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "all",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    sequence.body.body = [command];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, []);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 2, y: 4, z: 6 },
    });
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("applies sequence variables", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "toast(variable(\"Variable\"))" },
    }];
    sequence.body.args.locals.body = [{
      kind: "variable_declaration",
      args: {
        label: "Variable",
        data_value: { kind: "text", args: { string: "v" } },
      },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("v", TOAST_OPTIONS().info);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't duplicate sequence variables", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "toast(variable(\"Variable\"))" },
    }];
    sequence.body.args.locals.body = [{
      kind: "variable_declaration",
      args: {
        label: "Variable",
        data_value: { kind: "text", args: { string: "v" } },
      },
    }];
    sequence.body.id = 1;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Variable",
        data_value: { kind: "text", args: { string: "abc" } },
      },
    }];
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("abc", TOAST_OPTIONS().info);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it("handles missing variable name sets", () => {
    setCurrent({ x: 2, y: 4, z: 6 });
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Number\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    ri.sequenceMetas = { [sequence.uuid]: { foo: undefined } };
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "Variable \"Number\" of type undefined not implemented.",
      type: "error",
      channels: ["undefined"],
      verbosity: undefined,
      x: 2,
      y: 4,
      z: 6,
    });
    expect(console.log).toHaveBeenCalledWith("undefined");
    expect(error).not.toHaveBeenCalled();
  });

  it("handles missing variables", () => {
    setCurrent({ x: 2, y: 4, z: 6 });
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Number\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    ri.sequenceMetas = {};
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "Variable \"Number\" of type undefined not implemented.",
      type: "error",
      channels: ["undefined"],
      verbosity: undefined,
      x: 2,
      y: 4,
      z: 6,
    });
    expect(console.log).toHaveBeenCalledWith("undefined");
    expect(error).not.toHaveBeenCalled();
  });

  it("handles missing sequence body", () => {
    const sequence = fakeSequence();
    sequence.body.body = undefined;
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    if (ri.references[0]) {
      (ri.references[0] as TaggedSequence).body.body = undefined;
    }
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(info).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("handles load error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "!" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(info).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Lua load error: [string \"!\"]:1: unexpected symbol near '!'",
    );
  });

  it("handles call error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "return blah + 5" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(info).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Lua call error:"));
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("attempt to perform arithmetic"));
  });
});

describe("collectDemoSequenceActions()", () => {
  it("collects actions", () => {
    const sequence1 = fakeSequence();
    sequence1.body.id = 1;
    const findHome1: FindHome = {
      kind: "find_home",
      args: { axis: "x", speed: 100 },
    };
    const execute: Execute = {
      kind: "execute",
      args: { sequence_id: 2 },
    };
    sequence1.body.body = [findHome1, execute];

    const sequence2 = fakeSequence();
    sequence2.body.id = 2;
    const findHome2: FindHome = {
      kind: "find_home",
      args: { axis: "y", speed: 100 },
    };
    sequence2.body.body = [findHome2];

    const ri = buildResourceIndex([sequence1, sequence2]).index;
    const actions = collectDemoSequenceActions(0, ri, 1, []);
    expect(actions).toEqual([
      { type: "find_home", args: ["x"] },
      { type: "find_home", args: ["y"] },
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it("handles circular references", () => {
    const sequence1 = fakeSequence();
    sequence1.body.id = 1;
    const execute2: Execute = {
      kind: "execute",
      args: { sequence_id: 2 },
    };
    sequence1.body.body = [execute2];

    const sequence2 = fakeSequence();
    sequence2.body.id = 2;
    const execute1: Execute = {
      kind: "execute",
      args: { sequence_id: 1 },
    };
    sequence2.body.body = [execute1];

    const ri = buildResourceIndex([sequence1, sequence2]).index;
    const actions = collectDemoSequenceActions(0, ri, 1, []);
    expect(actions).toEqual([]);
    expect(error).toHaveBeenCalledWith("Maximum call depth exceeded.");
  });
});

describe("runDemoLuaCode()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    console.log = jest.fn();
    jest.useFakeTimers();
    mockLocked = false;
    setCurrent({ x: 0, y: 0, z: 0 });
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([
      fakeFbosConfig(),
      firmwareConfig,
      fakeWebAppConfig(),
    ]);
  });

  it("runs print", () => {
    runDemoLuaCode("print(\"Hello, world!\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Hello, world!");
  });

  it("runs print: all", () => {
    runDemoLuaCode(`
      local a = 2 + 2
      function f()
      end
      print(a, false, true, nil, {1}, {a = {b = 1}}, f)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      "4	false	true	undefined	[1]	{\"a\":{\"b\":1}}	\"<function>\"");
  });

  it("runs garden_size", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_x = 5000;
    firmwareConfig.body.movement_axis_nr_steps_y = 10000;
    firmwareConfig.body.movement_axis_nr_steps_z = 12500;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    runDemoLuaCode(
      "print(garden_size().x)\n" +
      "print(garden_size().y)\n" +
      "print(garden_size().z)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1000");
    expect(console.log).toHaveBeenCalledWith("2000");
    expect(console.log).toHaveBeenCalledWith("500");
  });

  it("runs api: default method", () => {
    const point = fakePoint();
    point.body.id = 1;
    point.body.x = 0;
    mockResources = buildResourceIndex([point]);
    runDemoLuaCode(`
      local data = api{
        url="/api/points"
      }
      print(type(data), #data)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs api: handles the unexpected", () => {
    const point = fakePoint();
    point.body.id = 1;
    point.body.x = undefined as unknown as number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (point.body as any).function = () => { };
    mockResources = buildResourceIndex([point]);
    runDemoLuaCode(`
      local data = api{
        url="/api/points"
      }
      print(type(data), #data)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs api: creates point", () => {
    mockResources = buildResourceIndex([]);
    runDemoLuaCode(`
      api{ url="/api/points",
           method="POST",
           body={
             name = "test",
             pointer_type = "GenericPointer",
             x = 1, y = 2, z = 3,
             radius = 5 }}`);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Point", {
      name: "test", pointer_type: "GenericPointer",
      x: 1, y: 2, z: 3, radius: 5, meta: {},
    });
  });

  it("runs api: creates point with meta", () => {
    mockResources = buildResourceIndex([]);
    runDemoLuaCode(`
      api{ url="/api/points",
           method="POST",
           body={
             name = "test",
             pointer_type = "GenericPointer",
             meta = { color = "red" },
             x = 1, y = 2, z = 3,
             radius = 5 }}`);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Point", {
      name: "test", pointer_type: "GenericPointer",
      x: 1, y: 2, z: 3, radius: 5, meta: { color: "red" },
    });
  });

  it("runs api: tools", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    mockResources = buildResourceIndex([tool]);
    runDemoLuaCode(`
      local data = api{
        method = "GET",
        url = "/api/tools"
      }
      print(type(data), #data)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs api: curves", () => {
    const curve = fakeCurve();
    curve.body.id = 1;
    mockResources = buildResourceIndex([curve]);
    runDemoLuaCode(`
      local data = api{
        method = "GET",
        url = "/api/curves/1"
      }
      print(type(data), #data)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs api: other", () => {
    setCurrent({ x: 2, y: 4, z: 6 });
    mockResources = buildResourceIndex([]);
    runDemoLuaCode(`
      local data = api{
        method = "GET",
        url = "/api/other"
      }
      print(data)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("false");
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith(
      "Log",
      {
        message: "API call GET /api/other not implemented.",
        type: "error",
        channels: ["undefined"],
        verbosity: undefined,
        x: 2,
        y: 4,
        z: 6,
      });
  });

  it("runs get_plants", () => {
    const point1 = fakePlant();
    point1.body.id = 1;
    point1.body.plant_stage = "planted";
    const point2 = fakePlant();
    point2.body.id = 2;
    point2.body.plant_stage = "planted";
    mockResources = buildResourceIndex([point1, point2]);
    runDemoLuaCode(`
      local points = get_plants()
      print(#points)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs get_weeds", () => {
    const point1 = fakeWeed();
    point1.body.id = 1;
    const point2 = fakeWeed();
    point2.body.id = 2;
    mockResources = buildResourceIndex([point1, point2]);
    runDemoLuaCode(`
      local points = get_weeds()
      print(#points)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs get_generic_points", () => {
    const point1 = fakePoint();
    point1.body.id = 1;
    const point2 = fakePoint();
    point2.body.id = 2;
    mockResources = buildResourceIndex([point1, point2]);
    runDemoLuaCode(`
      local points = get_generic_points()
      print(#points)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs sort", () => {
    const point1 = fakePlant();
    point1.body.id = 1;
    point1.body.plant_stage = "planted";
    const point2 = fakePlant();
    point2.body.id = 2;
    point2.body.plant_stage = "planted";
    mockResources = buildResourceIndex([point1, point2]);
    runDemoLuaCode(`
      local points = sort(get_plants(), "nn")
      print(#points)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs get_group", () => {
    const group = fakePointGroup();
    group.body.id = 1;
    group.body.point_ids = [1, 2];
    const point1 = fakePoint();
    point1.body.id = 1;
    const point2 = fakePoint();
    point2.body.id = 2;
    mockResources = buildResourceIndex([group, point1, point2]);
    runDemoLuaCode(`
      local points = get_group(1)
      print(#points)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs group", () => {
    const group = fakePointGroup();
    group.body.id = 1;
    group.body.point_ids = [1, 2];
    const point1 = fakePoint();
    point1.body.id = 1;
    const point2 = fakePoint();
    point2.body.id = 2;
    mockResources = buildResourceIndex([group, point1, point2]);
    runDemoLuaCode(`
      local point_ids = group(1)
      print(#point_ids)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("2");
  });

  it("runs to_unix", () => {
    runDemoLuaCode(`
      print(to_unix("2017-05-24T20:41:19.804Z"))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.any(String));
  });

  it("runs inspect", () => {
    runDemoLuaCode(`
      print(inspect({1, 2, 3}))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("[3,2,1]");
  });

  it("runs json.encode", () => {
    runDemoLuaCode(`
      print(json.encode({1, 2, 3}))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("[3,2,1]");
  });

  it("runs json.decode", () => {
    runDemoLuaCode(`
      print(json.decode("{}"))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("[]");
  });

  it("runs json.decode: handles bad json", () => {
    runDemoLuaCode(`
      print(json.decode("{"))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("undefined");
  });

  it("runs cs_eval", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode(`
      cs_eval{
        kind = "rpc_request",
        args = { label = "", priority = 0 },
        body = {
          { kind = "find_home", args = { axis = "x" } }
        }
      }
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 3 },
    });
  });

  it("runs cs_eval: execute", () => {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [{
      kind: "send_message",
      args: { message: "test", message_type: "info" },
    }];
    mockResources = buildResourceIndex([sequence]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode(`
      cs_eval{
        kind = "rpc_request",
        args = { label = "", priority = 0 },
        body = {
          { kind = "execute", args = { sequence_id = 1 } }
        }
      }
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "test",
      type: "info",
      channels: ["undefined"],
      verbosity: undefined,
      x: 1,
      y: 2,
      z: 3,
    });
  });

  it("runs cs_eval: no body", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("cs_eval{}");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("runs toast", () => {
    runDemoLuaCode("toast(\"test\", \"info\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("runs toast: default", () => {
    runDemoLuaCode("toast(\"test\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("runs debug", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("debug(\"test\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "test",
      type: "debug",
      channels: ["undefined"],
      verbosity: undefined,
      x: 1,
      y: 2,
      z: 3,
    });
  });

  it("runs send_message", () => {
    runDemoLuaCode("send_message(\"info\", \"test\", \"toast\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("runs send_message: multiple channels", () => {
    runDemoLuaCode("send_message(\"info\", \"test\", {\"email\", \"toast\"})");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("sets job progress: working", () => {
    runDemoLuaCode(`
      set_job_progress("job", {
        percent = 50,
        status = "working",
        time = os.time() * 1000
      })
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 50,
        status: "working",
        type: "unknown",
        file_type: "",
        updated_at: expect.any(Number),
        time: expect.any(Number),
      }],
    });
  });

  it("sets job progress: complete", () => {
    runDemoLuaCode(`
      set_job_progress("job", {
        percent = 100,
        status = "Complete",
        time = os.time() * 1000
      })
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 100,
        status: "Complete",
        type: "unknown",
        file_type: "",
        updated_at: expect.any(Number),
        time: undefined,
      }],
    });
  });

  it("runs complete_job", () => {
    runDemoLuaCode(`
      complete_job("job")
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 100,
        status: "Complete",
        type: "unknown",
        file_type: "",
        updated_at: expect.any(Number),
        time: undefined,
      }],
    });
  });

  it("runs set_job", () => {
    mockJobs.job = { percent: 0, status: "Farming" };
    runDemoLuaCode(`
      set_job("job", {percent = 50})
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 50,
        status: "Farming",
        type: "unknown",
        file_type: "",
        updated_at: expect.any(Number),
        time: expect.any(Number),
      }],
    });
  });

  it("runs set_job: existing job is complete", () => {
    mockJobs.job = { percent: 100, status: "Complete" };
    runDemoLuaCode(`
      set_job("job", {time = 1000})
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 0,
        status: "Working",
        type: "unknown",
        file_type: "",
        updated_at: expect.any(Number),
        time: expect.any(Number),
      }],
    });
  });

  it("runs get_job", () => {
    mockJobs.job = { percent: 50 };
    runDemoLuaCode(`
      print(get_job("job").percent)
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("50");
  });

  it("runs get_job: handles missing", () => {
    mockJobs = { "not": {} };
    runDemoLuaCode(`
      print(get_job("job"))
    `);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("undefined");
  });

  it("runs find_home: all", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("find_home(\"all\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs go_to_home: all", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("go_to_home(\"all\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs go_to_home: x", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("go_to_home(\"x\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 3 },
    });
  });

  it("runs go_to_home: y", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("go_to_home(\"y\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 3 },
    });
  });

  it.each<[number, number, number]>([
    [0, 0, 100],
    [1, 0, 100],
  ])("runs find_axis_length: x %s %s %s", (up, first, second) => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_x = 500;
    firmwareConfig.body.movement_home_up_x = up;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("find_axis_length(\"x\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: first, y: 2, z: 3 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: second, y: 2, z: 3 },
    });
  });

  it.each<[number, number, number]>([
    [0, 0, 100],
    [1, 0, 100],
  ])("runs find_axis_length: y %s %s %s", (up, first, second) => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_y = 500;
    firmwareConfig.body.movement_home_up_y = up;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("find_axis_length(\"y\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: first, z: 3 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: second, z: 3 },
    });
  });

  it.each<[number, number, number]>([
    [0, 0, 100],
    [1, 0, -100],
  ])("runs find_axis_length: z %s %s %s", (up, first, second) => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_z = 2500;
    firmwareConfig.body.movement_home_up_z = up;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("find_axis_length(\"z\")");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 2, z: first },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 2, z: second },
    });
  });

  it("runs toggle_pin", () => {
    runDemoLuaCode("toggle_pin(5)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_TOGGLE_PIN,
      payload: 5,
    });
  });

  it("runs write_pin", () => {
    runDemoLuaCode("write_pin(5, \"digital\", 1)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 1 },
    });
  });

  it("runs on", () => {
    runDemoLuaCode("on(5)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 1 },
    });
  });

  it("doesn't run when estopped", () => {
    mockLocked = true;
    runDemoLuaCode("on(5)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("runs off", () => {
    runDemoLuaCode("off(5)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 0 },
    });
  });

  it("runs safe_z", () => {
    runDemoLuaCode("print(safe_z())");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs env", () => {
    runDemoLuaCode("print(env(\"foo\"))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs soil_height", () => {
    runDemoLuaCode("print(soil_height(0, 0))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("-500");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs get_device", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 1;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(get_device(\"mounted_tool_id\"))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs get_device: undefined value", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = undefined;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(get_device(\"mounted_tool_id\"))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("false");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs update_device", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 0;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("update_device{ mounted_tool_id = 1 }");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(info).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(device, { mounted_tool_id: 1 });
    expect(save).toHaveBeenCalledWith(device.uuid);
  });

  it("runs read_pin 63: 0", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 1;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(read_pin(63))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs read_pin 63: 1", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 0;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(read_pin(63))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs read_pin 5", () => {
    setCurrent({ x: 1, y: 2, z: 0 });
    mockResources = buildResourceIndex([]);
    runDemoLuaCode("print(read_pin(5))");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("SensorReading", {
      pin: 5,
      mode: 1,
      x: 1,
      y: 2,
      z: 0,
      value: 0,
      read_at: expect.any(String),
    });
  });

  it("runs move_relative", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move_relative(1, 0, 0)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 2, y: 2, z: 3 },
    });
  });

  it("runs move_relative: zero", () => {
    setCurrent({ x: 0, y: 0, z: 0 });
    runDemoLuaCode("move_relative(0, 0, 0)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs move_absolute", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move_absolute(1, 0, 0)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 0 },
    });
  });

  it("runs move_absolute: alternate syntax", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move_absolute{ x = 1, y = 0, z = 0 }");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 0 },
    });
  });

  it("runs move_absolute: clamps positive", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_z = 2500;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move_absolute(0, 0, 1000)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 100 },
    });
  });

  it("runs move_absolute: clamps negative", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_z = 2500;
    firmwareConfig.body.movement_home_up_z = 1;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move_absolute(0, 0, -1000)");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: -100 },
    });
  });

  it("runs move: y", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move{ y = 1 }");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 1, z: 3 },
    });
  });

  it("runs move: x and z", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("move{ x = 0, z = 0 }");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 0 },
    });
  });

  it("runs take_photo", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("take_photo()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Image", {
      attachment_url: "http://localhost/soil.png",
      created_at: expect.any(String),
      meta: {
        name: "demo.png",
        x: 1,
        y: 2,
        z: 3,
      },
    });
  });

  it("runs calibrate_camera", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("calibrate_camera()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Image", {
      attachment_url: "http://localhost/soil.png",
      created_at: expect.any(String),
      meta: {
        name: "demo.png",
        x: 1,
        y: 2,
        z: 3,
      },
    });
  });

  it("runs detect_weeds", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("detect_weeds()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Image", {
      attachment_url: "http://localhost/soil.png",
      created_at: expect.any(String),
      meta: {
        name: "demo.png",
        x: 1,
        y: 2,
        z: 3,
      },
    });
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: {
        color: "red",
        created_by: "plant-detection",
      },
      name: "Weed",
      plant_stage: "pending",
      pointer_type: "Weed",
      radius: 50,
      x: 1,
      y: 2,
      z: -500,
    });
  });

  it("runs measure_soil_height", () => {
    setCurrent({ x: 1, y: 2, z: 3 });
    runDemoLuaCode("measure_soil_height()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("Image", {
      attachment_url: "http://localhost/soil.png",
      created_at: expect.any(String),
      meta: {
        name: "demo.png",
        x: 1,
        y: 2,
        z: 3,
      },
    });
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: {
        at_soil_level: "true",
      },
      name: "Soil Height",
      pointer_type: "GenericPointer",
      radius: 0,
      x: 1,
      y: 2,
      z: -500,
    });
  });

  it("runs emergency_lock", () => {
    runDemoLuaCode("emergency_lock()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: true,
    });
  });

  it("runs emergency_unlock", () => {
    runDemoLuaCode("emergency_unlock()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: false,
    });
  });

  it("allows emergency_unlock", () => {
    mockLocked = true;
    runDemoLuaCode("emergency_unlock()");
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: false,
    });
  });

  it("runs non-implemented function", () => {
    setCurrent({ x: 0, y: 0, z: 0 });
    runDemoLuaCode("foo.bar.baz()");
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
    expect(init).toHaveBeenCalledWith("Log", {
      message: "Lua function \"foo.bar.baz\" is not implemented.",
      type: "error",
      channels: ["undefined"],
      verbosity: undefined,
      x: 0,
      y: 0,
      z: 0,
    });
  });
});

describe("csToLua()", () => {
  it("returns Lua", () => {
    expect(csToLua({ kind: "emergency_lock", args: {} }))
      .toEqual("emergency_lock()");
  });
});

/**
 * Lua functions available in the demo runner
 *
 * builtins/lib:
 * [ y ] print
 * [ y ] type
 * [ y ] tostring
 * [ y ] tonumber
 * [ y ] pairs
 * [ y ] ipairs
 * [ y ] os.date
 * [ y ] os.time
 * [ y ] math.
 * [ y ] table.
 * [ y ] string.
 *
 * Other:
 * [ y ] move_relative
 * [ y ] round
 * [ y ] angleRound
 * [ y ] cropAmount
 * [ y ] fwe
 * [ y ] axis_overwrite
 * [ y ] speed_overwrite
 * [ y ] iso8601
 * [ y ] current_year
 * [ y ] current_day
 *
 * FBOS:
 * [ y ] variable
 * [   ] auth_token
 * [ y ] api
 * [   ] base64.decode
 * [   ] base64.encode
 * [ y ] calibrate_camera
 * [   ] check_position
 * [ y ] complete_job
 * [   ] coordinate
 * [ y ] cs_eval
 * [ y ] current_hour
 * [ y ] current_minute
 * [ y ] current_month
 * [ y ] current_second
 * [ y ] detect_weeds
 * [ y ] dispense
 * [ y ] emergency_lock
 * [ y ] emergency_unlock
 * [ y ] env
 * [   ] fbos_version
 * [ y ] find_axis_length
 * [ y ] find_home
 * [   ] firmware_version
 * [ y ] garden_size
 * [   ] gcode
 * [ y ] get_curve
 * [ y ] get_device
 * [   ] get_fbos_config
 * [   ] get_firmware_config
 * [ y ] get_job
 * [ y ] get_job_progress
 * [   ] get_position
 * [ y ] get_seed_tray_cell
 * [   ] get_xyz
 * [ y ] get_tool
 * [ y ] get_plants
 * [ y ] get_weeds
 * [ y ] get_generic_points
 * [ y ] get_group
 * [ y ] go_to_home
 * [ y ] grid
 * [ y ] group
 * [   ] http
 * [ y ] inspect
 * [ y ] json.decode
 * [ y ] json.encode
 * [ y ] measure_soil_height
 * [ y ] mount_tool
 * [ y ] dismount_tool
 * [ y ] move_absolute
 * [ y ] move
 * [   ] new_sensor_reading
 * [ y ] photo_grid
 * [ y ] read_pin
 * [   ] read_status
 * [ y ] rpc
 * [ y ] sequence
 * [ y ] send_message
 * [ y ] debug
 * [ y ] toast
 * [ y ] safe_z
 * [ y ] set_job
 * [ y ] set_job_progress
 * [   ] set_pin_io_mode
 * [   ] soft_stop
 * [ y ] soil_height
 * [ y ] sort
 * [   ] take_photo_raw
 * [ y ] take_photo
 * [ y ] toggle_pin
 * [   ] uart.open
 * [   ] uart.list
 * [ y ] update_device
 * [   ] update_fbos_config
 * [   ] update_firmware_config
 * [ y ] utc
 * [   ] local_time
 * [ y ] to_unix
 * [ y ] verify_tool
 * [ y ] wait_ms
 * [ y ] wait
 * [ y ] water
 * [   ] watch_pin
 * [ y ] on
 * [ y ] off
 * [ y ] write_pin
 */
