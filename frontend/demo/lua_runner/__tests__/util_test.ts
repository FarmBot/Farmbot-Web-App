import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePeripheral,
  fakePlant,
  fakePoint,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);

import { csToLua, filterPoint } from "../util";
import { store } from "../../../redux/store";
import {
  EmergencyLock,
  EmergencyUnlock,
  ExecuteScript,
  FindHome,
  Home,
  Lua,
  Move,
  MoveAbsolute,
  MoveRelative,
  PlantStage,
  SendMessage,
  SequenceBodyItem,
  TakePhoto,
  TogglePin,
  Wait,
  WritePin,
} from "farmbot";

const originalGetState = store.getState;
const mockGetState = () => ({ resources: mockResources });

beforeEach(() => {
  (store as unknown as { getState: Function }).getState = mockGetState;
});

afterAll(() => {
  (store as unknown as { getState: Function }).getState = originalGetState;
});

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

  it("converts celery script to lua: take_photo", () => {
    const command: TakePhoto = { kind: "take_photo", args: {} };
    expect(csToLua(command)).toEqual("take_photo()");
  });

  it("converts celery script to lua: execute_script: plant-detection", () => {
    const command: ExecuteScript = {
      kind: "execute_script",
      args: { label: "plant-detection" },
    };
    expect(csToLua(command)).toEqual("detect_weeds()");
  });

  it("converts celery script to lua: execute_script Measure Soil Height", () => {
    const command: ExecuteScript = {
      kind: "execute_script",
      args: { label: "Measure Soil Height" },
    };
    expect(csToLua(command)).toEqual("measure_soil_height()");
  });

  it("converts celery script to lua: execute_script other", () => {
    const command: ExecuteScript = {
      kind: "execute_script",
      args: { label: "other" },
    };
    expect(csToLua(command)).toEqual("");
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
    expect(csToLua(command)).toEqual(
      "_move(\"[{\\\"kind\\\":\\\"axis_overwrite\\\",\\\"args\\\":{" +
      "\\\"axis\\\":\\\"y\\\",\\\"axis_operand\\\":{\\\"kind\\\":\\\"" +
      "numeric\\\",\\\"args\\\":{\\\"number\\\":1}}}}]\")");
  });

  it("converts celery script to lua: move no body", () => {
    const command: Move = { kind: "move", args: {} };
    expect(csToLua(command)).toEqual("_move(\"[]\")");
  });

  it("converts celery script to lua: write_pin", () => {
    const command: WritePin = {
      kind: "write_pin",
      args: { pin_number: 1, pin_mode: 0, pin_value: 1 },
    };
    expect(csToLua(command)).toEqual("write_pin(1, \"digital\", 1)");
  });

  it("converts celery script to lua: peripheral", () => {
    const peripheral = fakePeripheral();
    peripheral.body.id = 1;
    peripheral.body.pin = 2;
    mockResources = buildResourceIndex([peripheral]);
    const command: WritePin = {
      kind: "write_pin",
      args: {
        pin_number: {
          kind: "named_pin",
          args: { pin_id: 1, pin_type: "Peripheral" },
        },
        pin_mode: 0,
        pin_value: 1,
      },
    };
    expect(csToLua(command)).toEqual("write_pin(2, \"digital\", 1)");
  });

  it("converts celery script to lua: missing peripheral", () => {
    mockResources = buildResourceIndex([]);
    const command: WritePin = {
      kind: "write_pin",
      args: {
        pin_number: {
          kind: "named_pin",
          args: { pin_id: 1, pin_type: "Peripheral" },
        },
        pin_mode: 0,
        pin_value: 1,
      },
    };
    expect(csToLua(command)).toEqual("");
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

describe("filterPoint()", () => {
  it.each<[string, PlantStage, boolean]>([
    ["yes", "planted", true],
    ["no", "planned", false],
  ])("filters point: stage filter %s", (_label, value, bool) => {
    const p = fakePlant().body;
    p.plant_stage = value;
    expect(filterPoint({ plant_stage: "planted" }, undefined)(p)).toEqual(bool);
  });

  it("filters point: no default stage filter", () => {
    const p = fakePlant().body;
    expect(filterPoint({}, undefined)(p)).toBeTruthy();
  });

  it("filters point: with default stage filter", () => {
    const p = fakePlant().body;
    p.plant_stage = "planted";
    expect(filterPoint({}, "planted")(p)).toBeTruthy();
  });

  it.each<[string, string, boolean]>([
    ["yes", "mint", true],
    ["no", "strawberry", false],
  ])("filters point: slug filter %s", (_label, value, bool) => {
    const p = fakePlant().body;
    p.openfarm_slug = value;
    expect(filterPoint({ openfarm_slug: "mint" }, undefined)(p)).toEqual(bool);
  });

  it("filters point: age filter undefined", () => {
    const p = fakePlant().body;
    p.planted_at = undefined;
    expect(filterPoint({ min_age: 0, max_age: 1 }, undefined)(p)).toBeTruthy();
  });

  it.each<[string, string, boolean]>([
    ["yes", "2018-01-23T05:00:00.000Z", true],
    ["no", "2999-01-23T05:00:00.000Z", false],
  ])("filters point: age filter %s", (_label, value, bool) => {
    const p = fakePlant().body;
    p.planted_at = value;
    expect(filterPoint({ min_age: 10 }, undefined)(p)).toEqual(bool);
  });

  it.each<[string, number, boolean]>([
    ["yes", 100, true],
    ["no", 0, false],
  ])("filters point: radius filter %s", (_label, value, bool) => {
    const p = fakePlant().body;
    p.radius = value;
    expect(filterPoint({ min_radius: 10, max_radius: 1000 }, undefined)(p))
      .toEqual(bool);
  });

  it.each<[string, string, boolean]>([
    ["yes", "red", true],
    ["no", "green", false],
  ])("filters point: color filter %s", (_label, value, bool) => {
    const p = fakePoint().body;
    p.meta.color = value;
    expect(filterPoint({ color: "red" }, undefined)(p)).toEqual(bool);
  });

  it.each<[string, string, boolean]>([
    ["yes", "true", true],
    ["no", "false", false],
  ])("filters point: soil level filter true %s", (_label, value, bool) => {
    const p = fakePoint().body;
    p.meta.at_soil_level = value;
    expect(filterPoint({ at_soil_level: "true" }, undefined)(p)).toEqual(bool);
  });

  it("filters point: soil level filter nil", () => {
    const p = fakePoint().body;
    p.meta.at_soil_level = undefined;
    expect(filterPoint({ at_soil_level: "false" }, undefined)(p)).toBeTruthy();
  });

  it("filters point: soil level filter false", () => {
    const p = fakePoint().body;
    p.meta.at_soil_level = "false";
    expect(filterPoint({ at_soil_level: "false" }, undefined)(p)).toBeTruthy();
  });
});
