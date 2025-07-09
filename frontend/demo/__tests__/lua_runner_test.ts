import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFirmwareConfig,
  fakeSequence, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
let mockLocked = false;
let mockPosition = { x: 0, y: 0, z: 0 };
const firmwareConfig = fakeFirmwareConfig();
firmwareConfig.body.movement_axis_nr_steps_x = 5000;
firmwareConfig.body.movement_axis_nr_steps_y = 10000;
firmwareConfig.body.movement_axis_nr_steps_z = 12500;
jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => ({
      resources: buildResourceIndex([
        fakeToolSlot(),
        firmwareConfig,
      ]),
      bot: {
        hardware: {
          location_data: { position: mockPosition },
          informational_settings: { locked: mockLocked },
        },
      },
    }),
  },
}));

import { ParameterApplication, TaggedSequence } from "farmbot";
import { Actions } from "../../constants";
import { store } from "../../redux/store";
import { info } from "../../toast/toast";
import { runDemoLuaCode, runDemoSequence } from "../lua_runner";
import { TOAST_OPTIONS } from "../../toast/constants";

const code = `
  n = variable("Number")
  print(n)
  api{method = "GET", url = "/api/points"}
  api{method = "POST", url = "/api/points"}
  api{method = "GET", url = "/api/tools"}
  pairs({})
  os.time()
  move_absolute(0, 0, 0)
  wait(1000)
  move_absolute(300, 0, 0)
  move_absolute(350, 0, 0)
  write_pin(8, "digital", 1)
  wait(1000)
  write_pin(8, "digital", 0)
  send_message("info", "msg", "toast")
  send_message("success", "msg", "toast")
  set_job_progress("job", {
    percent = 50,
    status = "working",
    time = os.time() * 1000
  })
  set_job_progress("job", {
    percent = 100,
    status = "Complete",
    time = os.time() * 1000
  })
  `;

describe("runDemoSequence()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
  });

  it("runs sequence", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: code } }];
    sequence.body.id = 1;
    const point = fakeToolSlot();
    const ri = buildResourceIndex([sequence, point]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Number",
        data_value: { kind: "numeric", args: { number: 1 } },
      },
    }];
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 100, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 200, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 300, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 350, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 8, value: 1 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 8, value: 0 },
    });
    expect(info).toHaveBeenCalledWith("msg", TOAST_OPTIONS().info);
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
    expect(console.error).not.toHaveBeenCalled();
  });

  it("handles missing variables", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: code } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith(
      "Variables of type other than numeric not implemented.",
      TOAST_OPTIONS().error);
    expect(console.log).toHaveBeenCalled();
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
  });

  it("runs print", () => {
    runDemoLuaCode("print(\"Hello, world!\")");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Hello, world!");
  });

  it("runs print: all", () => {
    runDemoLuaCode("local a = 2 + 2\nprint(a, false, true, nil)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("4	false	true	<non-printable>");
  });

  it("runs garden_size", () => {
    runDemoLuaCode(
      "print(garden_size().x)\n" +
      "print(garden_size().y)\n" +
      "print(garden_size().z)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("1000.0");
    expect(console.log).toHaveBeenCalledWith("2000.0");
    expect(console.log).toHaveBeenCalledWith("500.0");
  });

  it("runs api: default method", () => {
    runDemoLuaCode(
      "local data = api{url=\"/api/points\"}\nprint(type(data), #data)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("table	1");
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
      payload: { pin: 5, value: 1 },
    });
  });

  it("runs on", () => {
    runDemoLuaCode("on(5)");
    jest.runAllTimers();
    expect(console.error).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 5, value: 1 },
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
      payload: { pin: 5, value: 0 },
    });
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

/**
 * Lua functions available in the demo runner
 *
 * builtins/lib:
 * [ y ] print
 * [ y ] type
 * [ y ] tostring
 * [ y ] pairs
 * [ y ] ipairs
 * [ y ] os.time
 * [ y ] math.
 * [ y ] table.
 *
 * Other:
 * [ y ] move_relative
 * [ y ] round
 * [ y ] angleRound
 * [ y ] cropAmount
 * [ y ] fwe
 * [ y ] axis_overwrite
 * [ y ] speed_overwrite
 *
 * FBOS:
 * [ y ] variable (numeric only)
 * [   ] auth_token
 * [ y ] api (GET /api/points only)
 * [   ] base64.decode
 * [   ] base64.encode
 * [   ] calibrate_camera
 * [   ] check_position
 * [   ] complete_job
 * [   ] coordinate
 * [   ] cs_eval
 * [   ] current_hour
 * [   ] current_minute
 * [   ] current_month
 * [   ] current_second
 * [   ] detect_weeds
 * [ y ] dispense
 * [ y ] emergency_lock
 * [ y ] emergency_unlock
 * [   ] env
 * [   ] fbos_version
 * [   ] find_axis_length
 * [ y ] find_home
 * [   ] firmware_version
 * [ y ] garden_size
 * [   ] gcode
 * [ y ] get_curve
 * [   ] get_device
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
 * [   ] read_pin
 * [   ] read_status
 * [ y ] rpc
 * [ y ] sequence
 * [ y ] send_message (info only)
 * [   ] debug
 * [ y ] toast (info only)
 * [   ] safe_z
 * [   ] set_job
 * [ y ] set_job_progress
 * [   ] set_pin_io_mode
 * [   ] soft_stop
 * [   ] soil_height
 * [   ] sort
 * [   ] take_photo_raw
 * [   ] take_photo
 * [ y ] toggle_pin
 * [   ] uart.open
 * [   ] uart.list
 * [   ] update_device
 * [   ] update_fbos_config
 * [   ] update_firmware_config
 * [   ] utc
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
