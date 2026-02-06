import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
  fakePlant,
  fakeTool,
  fakeToolSlot,
  fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);

import {
  AxisAddition, AxisOverwrite, Move, MoveBodyItem, ParameterApplication,
} from "farmbot";
import { addDefaults, calculateMove } from "../calculate_move";
import { setCurrent } from "../actions";
import { store } from "../../../redux/store";
import * as triangleFunctions from "../../../three_d_garden/triangle_functions";

const originalGetState = store.getState;
const mockGetState = () => ({
  resources: mockResources,
  bot: {
    hardware: {
      location_data: { position: { x: 0, y: 0, z: 0 } },
      informational_settings: { locked: false },
    },
  },
});

describe("addDefaults()", () => {
  beforeEach(() => {
    (store as unknown as { getState: Function }).getState = mockGetState;
  });

  it("adds defaults", () => {
    const config = fakeFbosConfig();
    config.body.default_axis_order = "safe_z";
    mockResources = buildResourceIndex([config]);
    expect(addDefaults([])).toEqual([{ kind: "safe_z", args: {} }]);
  });

  it("doesn't add defaults", () => {
    expect(addDefaults([
      { kind: "axis_order", args: { grouping: "xyz", route: "in_order" } },
    ])).toEqual([
      { kind: "axis_order", args: { grouping: "xyz", route: "in_order" } },
    ]);
  });
});

describe("calculateMove()", () => {
  beforeEach(() => {
    (store as unknown as { getState: Function }).getState = mockGetState;
    jest.spyOn(triangleFunctions, "getZFunc")
      .mockImplementation(() => () => 3);
    setCurrent({ x: 0, y: 0, z: 0 });
    localStorage.removeItem("timeStepMs");
    localStorage.removeItem("mmPerSecond");
    console.log = jest.fn();
    mockResources = buildResourceIndex([
      fakeFirmwareConfig(),
      fakeFbosConfig(),
      fakeWebAppConfig(),
    ]);
  });

  it("handles number single axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "x",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 2, y: 2, z: 3 }], warnings: [] });
  });

  it("handles number all axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 2, y: 3, z: 4 }], warnings: [] });
  });

  it("handles coordinate single axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "x",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 2, y: 2, z: 3 }], warnings: [] });
  });

  it("handles coordinate all axis addition", () => {
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
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 2, y: 4, z: 6 }], warnings: [] });
  });

  it("handles number single axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "numeric", args: { number: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 3, y: 2, z: 3 }], warnings: [] });
  });

  it("handles number all axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ moves: [{ x: 1, y: 1, z: 1 }], warnings: [] });
  });

  it("handles coordinate single axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 1, y: 0, z: 0 }], warnings: [] });
  });

  it("handles coordinate all axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 1, y: 2, z: 3 }], warnings: [] });
  });

  it("handles tool single axis overwrite", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    slot.body.x = 1;
    slot.body.y = 2;
    slot.body.z = 3;
    mockResources = buildResourceIndex([tool, slot]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 1, y: 0, z: 0 }], warnings: [] });
  });

  it("handles tool all axis overwrite", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    slot.body.x = 1;
    slot.body.y = 2;
    slot.body.z = 3;
    slot.body.gantry_mounted = true;
    mockResources = buildResourceIndex([tool, slot]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 2, z: 3 }], warnings: [] });
  });

  it("handles missing tool", () => {
    mockResources = buildResourceIndex([]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 0, z: 0 }], warnings: [] });
  });

  it("handles coordinate identifier all axis overwrite", () => {
    mockResources = buildResourceIndex([]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "coordinate",
            args: { x: 1, y: 2, z: 3 },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ moves: [{ x: 1, y: 2, z: 3 }], warnings: [] });
  });

  it("handles point identifier all axis overwrite", () => {
    const point = fakePlant();
    point.body.id = 1;
    point.body.x = 1;
    point.body.y = 2;
    point.body.z = 3;
    mockResources = buildResourceIndex([point]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "point",
            args: { pointer_id: 1, pointer_type: "Plant" },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ moves: [{ x: 1, y: 2, z: 3 }], warnings: [] });
  });

  it("handles missing point", () => {
    mockResources = buildResourceIndex([]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "point",
            args: { pointer_id: 1, pointer_type: "Plant" },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ moves: [{ x: 0, y: 0, z: 0 }], warnings: [] });
  });

  it("handles missing variables", () => {
    mockResources = buildResourceIndex([]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, undefined))
      .toEqual({
        moves: [{ x: 0, y: 0, z: 0 }],
        warnings: ["identifier location kind: undefined"],
      });
  });

  it("handles soil height z axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "soil_height" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 0, z: 3 }], warnings: [] });
  });

  it("handles soil height z axis overwrite: triangle data", () => {
    sessionStorage.setItem("soilSurfaceTriangles", "[\"foo\"]");
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "soil_height" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 0, z: 3 }], warnings: [] });
  });

  it("handles safe height z axis overwrite", () => {
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_home_up_z = 0;
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.safe_height = 3;
    mockResources = buildResourceIndex([fbosConfig, firmwareConfig]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "safe_height" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 0, z: 3 }], warnings: [] });
  });

  it("handles soil height z axis overwrite: wrong label", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "nope" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({
        moves: [{ x: 0, y: 0, z: 0 }],
        warnings: ["special_value label: nope"],
      });
  });

  it("handles safe_z", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        {
          kind: "speed_overwrite",
          args: {
            axis: "all",
            speed_setting: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "safe_z", args: {} },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 0 },
          { x: 100, y: 100, z: 0 },
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: xyz", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "axis_order", args: { grouping: "xyz", route: "in_order" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,xy", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,xy", route: "in_order" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 100 },
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,xy, high from low", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 0 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,xy", route: "high" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 0 },
          { x: 0, y: 0, z: 0 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,xy, high from high", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 10 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,xy", route: "high" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 0 }, []))
      .toEqual({
        moves: [
          { x: 10, y: 10, z: 0 },
          { x: 10, y: 10, z: 10 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,xy, low from high", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,xy", route: "low" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 100 },
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,xy, low from low", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 10 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,xy", route: "low" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 10, y: 10, z: 50 },
          { x: 10, y: 10, z: 10 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: xy,z, high from low", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 0 } },
          },
        },
        { kind: "axis_order", args: { grouping: "xy,z", route: "high" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 0 },
          { x: 0, y: 0, z: 0 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: x,z,y, high from low", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 0 } },
          },
        },
        { kind: "axis_order", args: { grouping: "x,z,y", route: "high" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 0 },
          { x: 0, y: 50, z: 0 },
          { x: 0, y: 0, z: 0 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: x,z,y, high from high", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "axis_order", args: { grouping: "x,z,y", route: "high" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 100, z: 50 },
          { x: 100, y: 100, z: 50 },
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles axis_order: z,y,x", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 100 } },
          },
        },
        { kind: "axis_order", args: { grouping: "z,y,x", route: "in_order" } },
      ],
    };
    expect(calculateMove(command.body, { x: 50, y: 50, z: 50 }, []))
      .toEqual({
        moves: [
          { x: 50, y: 50, z: 100 },
          { x: 50, y: 100, z: 100 },
          { x: 100, y: 100, z: 100 },
        ],
        warnings: [],
      });
  });

  it("handles unknown pieces", () => {
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "foo" as ParameterApplication["args"]["data_value"]["kind"],
            args: { pointer_id: 1, pointer_type: "Plant" },
          } as ParameterApplication["args"]["data_value"],
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "foo" as MoveBodyItem["kind"],
          args: {},
        } as MoveBodyItem,
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: {
              kind: "bar" as AxisOverwrite["args"]["axis_operand"]["kind"],
              args: {},
            } as AxisOverwrite["args"]["axis_operand"],
          },
        },
        {
          kind: "axis_addition",
          args: {
            axis: "all",
            axis_operand: {
              kind: "bar" as AxisAddition["args"]["axis_operand"]["kind"],
              args: {},
            } as AxisAddition["args"]["axis_operand"],
          },
        },
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({
        moves: [{ x: 0, y: 0, z: 0 }],
        warnings: [
          "item kind: foo",
          "axis_overwrite axis_operand kind: bar",
          "axis_addition axis_operand kind: bar",
          "identifier location kind: foo",
        ],
      });
  });

  it("handles missing body", () => {
    const command: Move = { kind: "move", args: {} };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ moves: [{ x: 0, y: 0, z: 0 }], warnings: [] });
  });
});

afterAll(() => {
  (store as unknown as { getState: Function }).getState = originalGetState;
  jest.restoreAllMocks();
});
