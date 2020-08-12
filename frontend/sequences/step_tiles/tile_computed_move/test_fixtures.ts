import { ComputedMoveState, LocSelection, AxisSelection } from "./interfaces";
import { Move } from "farmbot";

export const fakeNumericMoveStepState: ComputedMoveState = ({
  locationSelection: LocSelection.identifier,
  location: { kind: "identifier", args: { label: "v" } },
  more: false,
  selection: {
    x: AxisSelection.custom,
    y: AxisSelection.custom,
    z: AxisSelection.custom,
  },
  overwrite: { x: 1, y: 2, z: 3 },
  offset: { x: 4, y: 5, z: 6 },
  variance: { x: 7, y: 8, z: 9 },
  speed: { x: 10, y: 10, z: 10 },
  safeZ: true,
});

export const fakeNumericMoveStepCeleryScript: Move = {
  kind: "move",
  args: {},
  body: [
    {
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "numeric", args: { number: 1 } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "numeric", args: { number: 2 } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "numeric", args: { number: 3 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "x",
        axis_operand: { kind: "numeric", args: { number: 4 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "y",
        axis_operand: { kind: "numeric", args: { number: 5 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "z",
        axis_operand: { kind: "numeric", args: { number: 6 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "x",
        axis_operand: { kind: "random", args: { variance: 7 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "y",
        axis_operand: { kind: "random", args: { variance: 8 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "z",
        axis_operand: { kind: "random", args: { variance: 9 } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "x",
        speed_setting: { kind: "numeric", args: { number: 10 } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "y",
        speed_setting: { kind: "numeric", args: { number: 10 } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "z",
        speed_setting: { kind: "numeric", args: { number: 10 } },
      },
    },
    { kind: "safe_z", args: {} },
  ],
};

export const fakeLuaMoveStepState: ComputedMoveState = ({
  locationSelection: LocSelection.identifier,
  location: { kind: "identifier", args: { label: "v" } },
  more: false,
  selection: {
    x: AxisSelection.lua,
    y: AxisSelection.lua,
    z: AxisSelection.lua,
  },
  overwrite: { x: "1", y: "2", z: "3" },
  offset: { x: "4", y: "5", z: "6" },
  variance: { x: 7, y: 8, z: 9 },
  speed: { x: "10", y: "10", z: "10" },
  safeZ: true,
});

export const fakeLuaMoveStepCeleryScript: Move = {
  kind: "move",
  args: {},
  body: [
    {
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "identifier", args: { label: "v" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "lua", args: { lua: "1" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "lua", args: { lua: "2" } },
      },
    },
    {
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "lua", args: { lua: "3" } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "x",
        axis_operand: { kind: "lua", args: { lua: "4" } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "y",
        axis_operand: { kind: "lua", args: { lua: "5" } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "z",
        axis_operand: { kind: "lua", args: { lua: "6" } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "x",
        axis_operand: { kind: "random", args: { variance: 7 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "y",
        axis_operand: { kind: "random", args: { variance: 8 } },
      },
    },
    {
      kind: "axis_addition",
      args: {
        axis: "z",
        axis_operand: { kind: "random", args: { variance: 9 } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "x",
        speed_setting: { kind: "lua", args: { lua: "10" } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "y",
        speed_setting: { kind: "lua", args: { lua: "10" } },
      },
    },
    {
      kind: "speed_overwrite",
      args: {
        axis: "z",
        speed_setting: { kind: "lua", args: { lua: "10" } },
      },
    },
    { kind: "safe_z", args: {} },
  ],
};
