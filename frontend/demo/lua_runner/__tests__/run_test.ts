import { evalLua, executeLua, runLua } from "../run";
import { ParameterApplication } from "farmbot";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { store } from "../../../redux/store";
import * as stubs from "../stubs";
import { fakeState } from "../../../__test_support__/fake_state";

describe("runLua()", () => {
  let originalGetState: typeof store.getState;

  beforeEach(() => {
    originalGetState = store.getState;
    const state = fakeState();
    state.resources = buildResourceIndex([
      fakeDevice(), fakeFbosConfig(), fakeFirmwareConfig(), fakeWebAppConfig(),
    ]);
    state.bot.hardware.location_data.position = { x: 0, y: 0, z: 0 };
    // Predicting queued movement requires settings and a known position.
    (store as unknown as { getState: Function }).getState = () => state;
  });

  afterEach(() => {
    (store as unknown as { getState: Function }).getState = originalGetState;
  });

  it.each([undefined, { x: 10, y: 20, z: 0 }])(
    "returns actions with starting position %j", currentPosition => {
      const code = `
      move_absolute(1, 2, 3)
      wait_ms(1000)
      go_to_home("all")
      move{ y = 1 }
      `;
      expect(runLua(0, code, [], currentPosition)).toEqual([
        { type: "move_absolute", args: [1, 2, 3] },
        { type: "wait_ms", args: [1000] },
        { type: "go_to_home", args: ["all"] },
        {
          type: "_move",
          variables: [],
          args: [
            "[{\"kind\":\"axis_overwrite\",\"args\":{\"axis\":\"y\",\""
            + "axis_operand\":{\"kind\":\"numeric\",\"args\":{\"number\":1}}}}]",
          ],
        },
      ]);
    });

  it("captures move variables", () => {
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Location",
        data_value: {
          kind: "coordinate",
          args: { x: 1, y: 2, z: 3 },
        },
      },
    }];
    expect(runLua(0, "move{x = 1}", variables)[0])
      .toEqual(expect.objectContaining({ variables }));
  });

  it("posts points through the api shim", () => {
    const code = `
    local created = api{
      url = "/api/points",
      method = "POST",
      body = {
        pointer_type = "GenericPointer",
        name = "test",
        x = 1,
        y = 2,
        z = 3,
        radius = 4,
        meta = {},
      },
    }
    if created then
      toast("created")
    end
    `;

    expect(runLua(0, code, [])).toEqual([
      {
        type: "create_point",
        args: [
          "{\"pointer_type\":\"GenericPointer\",\"name\":\"test\",\"x\":1,"
          + "\"y\":2,\"z\":3,\"radius\":4,\"meta\":[]}",
        ],
      },
      { type: "send_message", args: ["info", "created", "toast"] },
    ]);
  });

  it("reports unsupported point api methods", () => {
    const code = `
    local deleted = api{
      url = "/api/points",
      method = "DELETE",
    }
    if not deleted then
      toast("not deleted", "error")
    end
    `;

    expect(runLua(0, code, [])).toEqual([
      {
        type: "send_message",
        args: ["error", "API call DELETE /api/points not implemented."],
      },
      { type: "send_message", args: ["error", "not deleted", "toast"] },
    ]);
  });
});

describe("Lua return values", () => {
  it("returns a value alongside actions", () => {
    expect(executeLua(0, "wait_ms(100)\nreturn 2 + 3", []))
      .toEqual({
        actions: [{ type: "wait_ms", args: [100] }],
        returnValue: 5,
      });
  });

  it("returns undefined when the script has no return value", () => {
    expect(executeLua(0, "wait_ms(100)", []))
      .toEqual({
        actions: [{ type: "wait_ms", args: [100] }],
        returnValue: undefined,
      });
  });

  it.each([
    ["2 + 3", 5],
    ["return 2 + 3", 5],
    ["'text'", "text"],
  ])("evaluates %s", (code, expected) => {
    expect(evalLua(code)).toEqual(expected);
  });

  it.each(["return (", "return blah + 5"])(
    "returns no value for invalid Lua: %s", code => {
      expect(executeLua(0, code, []))
        .toEqual({ actions: [], returnValue: undefined });
    });
});

describe("Lua device helpers", () => {
  const localTime = {
    year: 2026, month: 1, day: 2, hour: 3, minute: 4, second: 5,
    iso8601: "2026-01-02T03:04:05.006-08:00",
  };
  let device: ReturnType<typeof fakeDevice>;
  let fbosConfig: ReturnType<typeof fakeFbosConfig>;
  let firmwareConfig: ReturnType<typeof fakeFirmwareConfig>;
  const originalGetState = store.getState;
  let deviceState: ReturnType<typeof store.getState>;

  beforeEach(() => {
    device = fakeDevice({ timezone: "America/Los_Angeles" });
    fbosConfig = fakeFbosConfig();
    firmwareConfig = fakeFirmwareConfig();
    fbosConfig.body.safe_height = -123;
    firmwareConfig.body.movement_timeout_x = 123;
    const state = store.getState();
    deviceState = {
      ...state,
      resources: buildResourceIndex([
        device, fbosConfig, firmwareConfig, fakeWebAppConfig(),
      ]),
      bot: {
        ...state.bot,
        hardware: {
          ...state.bot.hardware,
          location_data: {
            ...state.bot.hardware.location_data,
            position: { x: 10, y: 20, z: 0 },
          },
        },
      },
    };
    (store as unknown as { getState: Function }).getState = () => deviceState;
  });

  afterEach(() => {
    (store as unknown as { getState: Function }).getState = originalGetState;
  });

  it.each([
    ["year", 2026], ["month", 1], ["day", 2],
    ["hour", 3], ["minute", 4], ["second", 5],
  ])("returns the local time field %s", (field, expected) => {
    const spy = jest.spyOn(stubs, "getLocalTime").mockReturnValue(localTime);
    expect(evalLua(`local_time("${field}")`)).toEqual(expected);
    expect(spy).toHaveBeenCalledWith("America/Los_Angeles");
  });

  it.each(["", '"unknown"', '"toString"', "42", "nil"])(
    "returns an ISO timestamp for local_time(%s)", argument => {
      jest.spyOn(stubs, "getLocalTime").mockReturnValue(localTime);
      expect(evalLua(`local_time(${argument})`)).toEqual(localTime.iso8601);
    });

  it("defaults local time to UTC without a device timezone", () => {
    device.body.timezone = undefined;
    deviceState.resources = buildResourceIndex([device]);
    const spy = jest.spyOn(stubs, "getLocalTime").mockReturnValue(localTime);
    expect(evalLua("local_time()")).toEqual(localTime.iso8601);
    expect(spy).toHaveBeenCalledWith("Etc/UTC");
  });

  it("reads FBOS settings through the API shim", () => {
    const spy = jest.spyOn(stubs, "getFbosSettings")
      .mockReturnValue(fbosConfig.body);
    try {
      expect(executeLua(0, `
        local config = api({url = "/api/fbos_config"})
        return config.safe_height
      `, [])).toEqual({ actions: [], returnValue: -123 });
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it("reads firmware settings through the API shim", () => {
    const spy = jest.spyOn(stubs, "getFirmwareSettings")
      .mockReturnValue(firmwareConfig.body);
    try {
      expect(executeLua(0, `
        local config = api({url = "/api/firmware_config"})
        return config.movement_timeout_x
      `, [])).toEqual({ actions: [], returnValue: 123 });
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it("reads the current position from device status", () => {
    expect(evalLua("read_status()")).toEqual(expect.objectContaining({
      location_data: expect.objectContaining({
        position: { x: 10, y: 20, z: 0 },
      }),
    }));
  });

  it("reads the predicted position after queued movement", () => {
    const result = executeLua(0, `
      move_relative(5, 10, 0)
      return read_status("location_data", "position")
    `, []);
    expect(result.returnValue).toEqual({ x: 15, y: 30, z: 0 });
    expect(store.getState().bot.hardware.location_data.position)
      .toEqual({ x: 10, y: 20, z: 0 });
  });

  it("uses the supplied starting position for status table paths", () => {
    expect(executeLua(0,
      'return read_status({"location_data", "position"})', [],
      { x: 40, y: 50, z: 0 }).returnValue)
      .toEqual({ x: 40, y: 50, z: 0 });
  });
});
