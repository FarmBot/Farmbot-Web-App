import { evalLua, executeLua, runLua } from "../run";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePeripheral, fakeSensor, fakeTool,
} from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import { store } from "../../../redux/store";

describe("Lua resource lookups", () => {
  let state: ReturnType<typeof fakeState>;
  let originalGetState: typeof store.getState;

  beforeEach(() => {
    state = fakeState();
    state.resources = buildResourceIndex([]);
    originalGetState = store.getState;
    store.getState = () => state;
  });

  afterEach(() => {
    store.getState = originalGetState;
  });

  describe.each([
    ["get_peripheral", fakePeripheral],
    ["get_sensor", fakeSensor],
  ] as const)("%s", (name, factory) => {
    const noMatchAction = {
      type: "send_message",
      args: ["error",
        `${name}(): No matching ${name.replace("get_", "")} found.`, "toast"],
    };
    it.each([
      "id = 123", "pin = 0", "mode = 0", 'label = "Configured pin"',
      'name = "Configured pin"', 'name = "Configured pin", pin = 0',
      'label = "Configured pin", name = "Ignored"',
      'label = nil, name = "Configured pin"',
      'type = "none"', 'id = 123, type = "none"',
      'id = 123, ignored = "value"', "", "id = nil",
    ])("finds a resource using %s", filter => {
      const resource = factory();
      Object.assign(resource.body, {
        id: 123, pin: 0, mode: 0, label: "Configured pin",
      });
      state.resources = buildResourceIndex([resource]);
      expect(evalLua(`${name}{${filter}}`)).toEqual({
        ...resource.body, name: resource.body.label,
      });
      expect(resource.body).not.toHaveProperty("name");
    });

    it.each([
      "id = -1", 'id = 123, label = "Different"',
      'name = "Different"', 'id = 123, name = "Different"',
      'label = "Different", name = "Configured pin"',
    ])(
      "returns nil for unmatched filters: %s", filter => {
        const resource = factory();
        resource.body.id = 123;
        resource.body.label = "Configured pin";
        state.resources = buildResourceIndex([resource]);
        expect(executeLua(0, `return ${name}{${filter}}`, [])).toEqual({
          returnValue: undefined,
          actions: [noMatchAction],
        });
      });

    it("returns nil and an error toast when no resources exist", () => {
      expect(executeLua(0, `return ${name}{}`, [])).toEqual({
        returnValue: undefined,
        actions: [noMatchAction],
      });
    });

    it.each(["", 'type = "none"', 'name = "Configured pin"'])(
      "returns nil and an error toast for multiple matches: %s", filter => {
        const first = factory();
        const second = factory();
        first.body.label = "Configured pin";
        second.body.label = "Configured pin";
        state.resources = buildResourceIndex([first, second]);
        expect(executeLua(0, `return ${name}{${filter}}`, [])).toEqual({
          returnValue: undefined,
          actions: [{
            type: "send_message",
            args: ["error",
              `${name}(): Multiple matches found. Use more specific filters.`,
              "toast"],
          }],
        });
      });

    it("finds a unique match among multiple resources", () => {
      const first = factory();
      const second = factory();
      first.body.id = 123;
      second.body.id = 456;
      state.resources = buildResourceIndex([first, second]);
      expect(executeLua(0, `return ${name}{id = 123}`, [])).toEqual({
        returnValue: { ...first.body, name: first.body.label },
        actions: [],
      });
      expect(evalLua(`${name}{id = 123}`)).toEqual({
        ...first.body, name: first.body.label,
      });
    });
  });

  describe("dispense", () => {
    beforeEach(() => {
      const tool = fakeTool();
      tool.body.type = "watering_nozzle";
      tool.body.flow_rate_ml_per_s = 100;
      state.resources = buildResourceIndex([tool]);
    });

    it.each([0, 7])("uses the configured water pin: %s", pin => {
      const tool = fakeTool();
      tool.body.type = "watering_nozzle";
      tool.body.flow_rate_ml_per_s = 100;
      const peripheral = fakePeripheral();
      peripheral.body.type = "water";
      peripheral.body.pin = pin;
      state.resources = buildResourceIndex([tool, peripheral]);
      const actions = runLua(0, "dispense(10)", []);
      expect(actions.filter(action => action.type == "write_pin")).toEqual([
        { type: "write_pin", args: [pin, "digital", 1] },
        { type: "write_pin", args: [pin, "digital", 0] },
      ]);
    });

    it("allows an explicit pin without a water peripheral", () => {
      const actions = runLua(0, "dispense(10, {pin = 9})", []);
      expect(actions.filter(action => action.type == "write_pin")).toEqual([
        { type: "write_pin", args: [9, "digital", 1] },
        { type: "write_pin", args: [9, "digital", 0] },
      ]);
    });

    it.each([false, true])("rejects missing water configuration: %s", exists => {
      if (exists) {
        const tool = fakeTool();
        tool.body.type = "watering_nozzle";
        tool.body.flow_rate_ml_per_s = 100;
        const peripheral = fakePeripheral();
        peripheral.body.type = "water";
        peripheral.body.pin = undefined;
        state.resources = buildResourceIndex([tool, peripheral]);
      }
      const expectedActions = [{
        type: "send_message",
        args: ["error",
          "Water peripheral not found or has no pin configured", "toast"],
      }];
      if (!exists) {
        expectedActions.unshift({
          type: "send_message",
          args: ["error", "get_peripheral(): No matching peripheral found.",
            "toast"],
        });
      }
      expect(runLua(0, "dispense(10)", [])).toEqual(expectedActions);
    });
  });

  describe("verify_tool", () => {
    it.each([false, true])("rejects missing sensor configuration: %s", exists => {
      const device = fakeDevice();
      const sensor = fakeSensor();
      sensor.body.type = "tool_verification";
      sensor.body.pin = undefined;
      state.resources = buildResourceIndex(exists ? [device, sensor] : [device]);
      expect(executeLua(0, "return verify_tool()", [])).toEqual({
        returnValue: false,
        actions: [
          ...(exists
            ? []
            : [{
              type: "send_message",
              args: ["error", "get_sensor(): No matching sensor found.", "toast"],
            }]),
          {
            type: "send_message",
            args: ["error",
              "Tool verification sensor not found or has no pin configured",
              "toast"],
          },
        ],
      });
    });

    it.each([0, 59, 63])("verifies a mounted tool using pin %s", pin => {
      const tool = fakeTool();
      tool.body.id = 123;
      const device = fakeDevice();
      device.body.mounted_tool_id = tool.body.id;
      const sensor = fakeSensor();
      sensor.body.type = "tool_verification";
      sensor.body.pin = pin;
      state.resources = buildResourceIndex([tool, device, sensor]);
      const result = executeLua(0, "return verify_tool()", []);
      expect(result.returnValue).toBe(true);
      expect(result.actions).toEqual([
        { type: "write_pin", args: [pin, "digital", 0] },
        { type: "send_message", args: ["success",
          `The ${tool.body.name} is mounted on the UTM`] },
      ]);
    });

    it("detects an unmounted tool using the configured sensor", () => {
      const device = fakeDevice();
      device.body.mounted_tool_id = undefined;
      const sensor = fakeSensor();
      sensor.body.type = "tool_verification";
      sensor.body.pin = 59;
      state.resources = buildResourceIndex([device, sensor]);
      const result = executeLua(0, "return verify_tool()", []);
      expect(result.returnValue).toBe(false);
      expect(result.actions[0]).toEqual({
        type: "write_pin", args: [59, "digital", 1],
      });
      expect(result.actions[1]).toEqual({
        type: "send_message", args: ["error", expect.stringContaining(
          "No tool detected on the UTM"), "toast"],
      });
    });
  });
});
