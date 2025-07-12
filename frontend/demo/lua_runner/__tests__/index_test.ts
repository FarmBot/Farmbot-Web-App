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
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);
let mockPosition = { x: 0, y: 0, z: 0 };
let mockLocked = false;
jest.mock("../../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => ({
      resources: mockResources,
      bot: {
        hardware: {
          location_data: { position: mockPosition },
          informational_settings: { locked: mockLocked },
        },
      },
    }),
  },
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import { ParameterApplication, TaggedSequence } from "farmbot";
import { Actions } from "../../../constants";
import { store } from "../../../redux/store";
import { info } from "../../../toast/toast";
import { csToLua, runDemoLuaCode, runDemoSequence } from "..";
import { TOAST_OPTIONS } from "../../../toast/constants";
import { edit, save } from "../../../api/crud";

describe("runDemoSequence()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("undefined");
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
    expect(info).toHaveBeenCalledWith(
      "Variable \"Other\" of type identifier not implemented.",
      TOAST_OPTIONS().error);
    expect(console.log).toHaveBeenCalledWith("undefined");
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("text", TOAST_OPTIONS().info);
    expect(console.log).not.toHaveBeenCalled();
  });

  it("handles missing variables", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{
      kind: "lua",
      args: { lua: "print(variable(\"Number\"))" },
    }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith(
      "Variable \"Number\" of type undefined not implemented.",
      TOAST_OPTIONS().error);
    expect(console.log).toHaveBeenCalledWith("undefined");
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("handles load error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "!" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Lua load error:",
      "[string \"!\"]:1: unexpected symbol near '!'",
    );
  });

  it("handles call error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "return blah + 5" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Lua call error:",
      expect.stringContaining("attempt to perform arithmetic"),
    );
  });
});

describe("runDemoLuaCode()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    mockLocked = false;
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
    expect(info).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs api: other", () => {
    mockResources = buildResourceIndex([]);
    runDemoLuaCode(`
      local data = api{
        method = "GET",
        url = "/api/other"
      }
      print(data)
    `);
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("false");
    expect(info).toHaveBeenCalledWith(
      "API call GET /api/other not implemented.",
      TOAST_OPTIONS().error,
    );
  });

  it("runs cs_eval", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
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
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 3 },
    });
  });

  it("runs cs_eval: no body", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("cs_eval{}");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("runs toast", () => {
    runDemoLuaCode("toast(\"test\", \"info\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("runs toast: default", () => {
    runDemoLuaCode("toast(\"test\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().info);
  });

  it("runs debug", () => {
    runDemoLuaCode("debug(\"test\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith("test", TOAST_OPTIONS().debug);
  });

  it("runs send_message", () => {
    runDemoLuaCode("send_message(\"info\", \"test\", \"toast\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 50,
        status: "working",
        type: "",
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
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 100,
        status: "Complete",
        type: "",
        file_type: "",
        updated_at: expect.any(Number),
        time: undefined,
      }],
    });
  });

  it("runs find_home: all", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("find_home(\"all\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs go_to_home: all", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("go_to_home(\"all\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs go_to_home: x", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("go_to_home(\"x\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 3 },
    });
  });

  it("runs go_to_home: y", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("go_to_home(\"y\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 3 },
    });
  });

  it("runs find_axis_length: x", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_x = 500;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("find_axis_length(\"x\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 3 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 100, y: 2, z: 3 },
    });
  });

  it("runs find_axis_length: y", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_y = 500;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("find_axis_length(\"y\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 3 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 100, z: 3 },
    });
  });

  it("runs find_axis_length: z", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_z = 2500;
    firmwareConfig.body.movement_home_up_z = 0;
    mockResources = buildResourceIndex([firmwareConfig, fakeWebAppConfig()]);
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("find_axis_length(\"z\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 2, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 2, z: 100 },
    });
  });

  it("runs toggle_pin", () => {
    runDemoLuaCode("toggle_pin(5)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_TOGGLE_PIN,
      payload: 5,
    });
  });

  it("runs write_pin", () => {
    runDemoLuaCode("write_pin(5, \"digital\", 1)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 1 },
    });
  });

  it("runs on", () => {
    runDemoLuaCode("on(5)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 1 },
    });
  });

  it("doesn't run when estopped", () => {
    mockLocked = true;
    runDemoLuaCode("on(5)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("runs off", () => {
    runDemoLuaCode("off(5)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, mode: "digital", value: 0 },
    });
  });

  it("runs safe_z", () => {
    runDemoLuaCode("print(safe_z())");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs env", () => {
    runDemoLuaCode("print(env(\"foo\"))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs soil_height", () => {
    runDemoLuaCode("print(soil_height(0, 0))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("-500");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs get_device", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 1;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(get_device(\"mounted_tool_id\"))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs get_device: undefined value", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = undefined;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(get_device(\"mounted_tool_id\"))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("false");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs update_device", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 0;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("update_device{ mounted_tool_id = 1 }");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
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
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs read_pin 63: 1", () => {
    const device = fakeDevice();
    device.body.mounted_tool_id = 0;
    mockResources = buildResourceIndex([device]);
    runDemoLuaCode("print(read_pin(63))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs read_pin 5", () => {
    mockResources = buildResourceIndex([]);
    runDemoLuaCode("print(read_pin(5))");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("0");
    expect(info).not.toHaveBeenCalled();
  });

  it("runs move_relative", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move_relative(1, 0, 0)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 2, y: 2, z: 3 },
    });
  });

  it("runs move_relative: zero", () => {
    mockPosition = { x: 0, y: 0, z: 0 };
    runDemoLuaCode("move_relative(0, 0, 0)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
  });

  it("runs move_absolute", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move_absolute(1, 0, 0)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 0, z: 0 },
    });
  });

  it("runs move_absolute: alternate syntax", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move_absolute{ x = 1, y = 0, z = 0 }");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
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
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move_absolute(0, 0, 1000)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
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
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move_absolute(0, 0, -1000)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: -100 },
    });
  });

  it("runs move: y", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move{ y = 1 }");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 1, y: 1, z: 3 },
    });
  });

  it("runs move: x and z", () => {
    mockPosition = { x: 1, y: 2, z: 3 };
    runDemoLuaCode("move{ x = 0, z = 0 }");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 2, z: 0 },
    });
  });

  it("runs emergency_lock", () => {
    runDemoLuaCode("emergency_lock()");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: true,
    });
  });

  it("runs emergency_unlock", () => {
    runDemoLuaCode("emergency_unlock()");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: false,
    });
  });

  it("allows emergency_unlock", () => {
    mockLocked = true;
    runDemoLuaCode("emergency_unlock()");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_ESTOP,
      payload: false,
    });
  });

  it("runs non-implemented function", () => {
    runDemoLuaCode("foo.bar.baz()");
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith(
      "Lua function \"foo.bar.baz\" is not implemented.",
      TOAST_OPTIONS().error,
    );
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
 * [ y ] variable (numeric/text only)
 * [   ] auth_token
 * [ y ] api (GET /api/points only)
 * [   ] base64.decode
 * [   ] base64.encode
 * [   ] calibrate_camera
 * [   ] check_position
 * [   ] complete_job
 * [   ] coordinate
 * [ y ] cs_eval
 * [ y ] current_hour
 * [ y ] current_minute
 * [ y ] current_month
 * [ y ] current_second
 * [   ] detect_weeds
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
 * [   ] get_job
 * [   ] get_job_progress
 * [   ] get_position
 * [ y ] get_seed_tray_cell
 * [   ] get_xyz
 * [   ] get_tool
 * [ y ] go_to_home
 * [ y ] grid
 * [   ] group
 * [   ] http
 * [   ] inspect
 * [   ] json.decode
 * [   ] json.encode
 * [   ] measure_soil_height
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
 * [ y ] send_message (info only)
 * [ y ] debug
 * [ y ] toast (info only)
 * [ y ] safe_z
 * [   ] set_job
 * [ y ] set_job_progress
 * [   ] set_pin_io_mode
 * [   ] soft_stop
 * [ y ] soil_height
 * [   ] sort
 * [   ] take_photo_raw
 * [   ] take_photo
 * [ y ] toggle_pin
 * [   ] uart.open
 * [   ] uart.list
 * [ y ] update_device
 * [   ] update_fbos_config
 * [   ] update_firmware_config
 * [ y ] utc
 * [   ] local_time
 * [   ] to_unix
 * [ y ] verify_tool
 * [ y ] wait_ms
 * [ y ] wait
 * [ y ] water
 * [   ] watch_pin
 * [ y ] on
 * [ y ] off
 * [ y ] write_pin (digital only)
 */
