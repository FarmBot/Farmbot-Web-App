import { csToLua } from "../util";
import {
  EmergencyLock, EmergencyUnlock, FindHome, Home, Lua, Move, MoveAbsolute,
  MoveRelative, SendMessage, SequenceBodyItem, TogglePin, Wait, WritePin,
} from "farmbot";

describe("csToLua()", () => {
  it("converts celery script to lua: lock", () => {
    const command: EmergencyLock = { kind: "emergency_lock", args: {} };
    expect(csToLua(command)).toEqual("emergency_lock()");
  });

  it("converts celery script to lua: unlock", () => {
    const command: EmergencyUnlock = { kind: "emergency_unlock", args: {} };
    expect(csToLua(command)).toEqual("emergency_unlock()");
  });

  it("converts celery script to lua: find_home", () => {
    const command: FindHome = {
      kind: "find_home",
      args: { axis: "x", speed: 100 },
    };
    expect(csToLua(command)).toEqual("find_home(\"x\")");
  });

  it("converts celery script to lua: home", () => {
    const command: Home = { kind: "home", args: { axis: "x", speed: 100 } };
    expect(csToLua(command)).toEqual("go_to_home(\"x\")");
  });

  it("converts celery script to lua: wait", () => {
    const command: Wait = { kind: "wait", args: { milliseconds: 1000 } };
    expect(csToLua(command)).toEqual("wait(1000)");
  });

  it("converts celery script to lua: send_message", () => {
    const command: SendMessage = {
      kind: "send_message",
      args: { message: "text", message_type: "info" },
    };
    expect(csToLua(command)).toEqual("send_message(\"info\", \"text\")");
  });

  it("converts celery script to lua: move_relative", () => {
    const command: MoveRelative = {
      kind: "move_relative",
      args: { x: 1, y: 2, z: 3, speed: 100 },
    };
    expect(csToLua(command)).toEqual("move_relative(1, 2, 3)");
  });

  it("converts celery script to lua: move_absolute coordinate", () => {
    const command: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
        speed: 100,
      },
    };
    expect(csToLua(command)).toEqual("move_absolute(1, 2, 3)");
  });

  it("converts celery script to lua: move_absolute other", () => {
    const command: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: { kind: "identifier", args: { label: "" } },
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
        speed: 100,
      },
    };
    expect(csToLua(command)).toEqual(
      "toast(\"move_absolute identifier is not implemented\", \"error\")");
  });

  it("converts celery script to lua: move", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "y",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(csToLua(command)).toEqual("move{y=1}");
  });

  it("converts celery script to lua: move no body", () => {
    const command: Move = { kind: "move", args: {} };
    expect(csToLua(command)).toEqual("move{}");
  });

  it("converts celery script to lua: write_pin", () => {
    const command: WritePin = {
      kind: "write_pin",
      args: { pin_number: 1, pin_mode: 0, pin_value: 1 },
    };
    expect(csToLua(command)).toEqual("write_pin(1, \"digital\", 1)");
  });

  it("converts celery script to lua: write_pin analog", () => {
    const command: WritePin = {
      kind: "write_pin",
      args: { pin_number: 1, pin_mode: 1, pin_value: 1 },
    };
    expect(csToLua(command)).toEqual("write_pin(1, \"analog\", 1)");
  });

  it("converts celery script to lua: toggle_pin", () => {
    const command: TogglePin = {
      kind: "toggle_pin",
      args: { pin_number: 1 },
    };
    expect(csToLua(command)).toEqual("toggle_pin(1)");
  });

  it("converts celery script to lua: lua", () => {
    const command: Lua = { kind: "lua", args: { lua: "print(\"lua\")" } };
    expect(csToLua(command)).toEqual("print(\"lua\")");
  });

  it("converts celery script to lua: not implemented", () => {
    const command = { kind: "nope", args: {} } as unknown as SequenceBodyItem;
    expect(csToLua(command)).toEqual(
      "toast(\"celeryscript nope is not implemented\", \"error\")");
  });
});
