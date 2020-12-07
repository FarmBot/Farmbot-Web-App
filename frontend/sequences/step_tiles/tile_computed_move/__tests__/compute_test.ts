import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { computeCoordinate } from "../compute";
import { fakeNumericMoveStepCeleryScript } from "../test_fixtures";
import { fakeVariableNameSet } from "../../../../__test_support__/fake_variables";
import { SpecialValue, Xyz } from "farmbot";
import {
  fakeFbosConfig,
  fakeTool, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { cloneDeep } from "lodash";

describe("computeCoordinate()", () => {
  it("computes coordinate", () => {
    const moveStep = fakeNumericMoveStepCeleryScript;
    const botPosition = { x: 0, y: 0, z: 0 };
    const resourceIndex = buildResourceIndex([]).index;
    const coordinate = computeCoordinate({
      step: moveStep,
      botPosition,
      resourceIndex,
      sequenceUuid: "seqUuid",
    });
    expect(coordinate).toEqual({ x: 12, y: 15, z: 18 });
  });

  it("computes coordinate with variable", () => {
    const moveStep = fakeNumericMoveStepCeleryScript;
    const botPosition = { x: 0, y: 0, z: 0 };
    const variables = fakeVariableNameSet("variable", { x: 10, y: 20, z: 30 });
    const resourceIndex = buildResourceIndex([]).index;
    resourceIndex.sequenceMetas["seqUuid"] = variables;
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "identifier", args: { label: "variable" } },
      },
    });
    const coordinate = computeCoordinate({
      step: moveStep,
      botPosition,
      resourceIndex,
      sequenceUuid: "seqUuid",
    });
    expect(coordinate).toEqual({ x: 10, y: 15, z: 18 });
  });

  it("computes coordinate for tool", () => {
    const moveStep = cloneDeep(fakeNumericMoveStepCeleryScript);
    const botPosition = { x: 0, y: 0, z: 0 };
    const tool1 = fakeTool();
    tool1.body.id = 1;
    const tool2 = fakeTool();
    tool2.body.id = 2;
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    slot.body.x = 100;
    slot.body.y = 200;
    slot.body.z = 300;
    const resourceIndex = buildResourceIndex([tool1, tool2, slot]).index;
    ["x", "y", "z"].map((axis: Xyz) =>
      moveStep.body && moveStep.body.push({
        kind: "axis_overwrite",
        args: {
          axis,
          axis_operand: { kind: "tool", args: { tool_id: 1 } },
        },
      }));
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "x",
        axis_operand: { kind: "tool", args: { tool_id: 2 } },
      },
    });
    const coordinate = computeCoordinate({
      step: moveStep,
      botPosition,
      resourceIndex,
      sequenceUuid: "seqUuid",
    });
    expect(coordinate).toEqual({ x: 100, y: 200, z: 300 });
  });

  it("computes coordinate with special value overwrites", () => {
    const moveStep = fakeNumericMoveStepCeleryScript;
    const currentLocationNode: SpecialValue = {
      kind: "special_value",
      args: { label: "current_location" }
    };
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: { axis: "x", axis_operand: currentLocationNode },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: { axis: "y", axis_operand: currentLocationNode },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "special_value", args: { label: "safe_height" } },
      },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "special_value", args: { label: "soil_height" } },
      },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "special_value", args: { label: "other" } },
      },
    });
    const botPosition = { x: 1, y: undefined, z: 3 };
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.soil_height = 30;
    fbosConfig.body.safe_height = 20;
    const resourceIndex = buildResourceIndex([fbosConfig]).index;
    const coordinate = computeCoordinate({
      step: moveStep,
      botPosition,
      resourceIndex,
      sequenceUuid: "seqUuid",
    });
    expect(coordinate).toEqual({ x: 1, y: 20, z: 30 });
  });

  it("computes coordinate with missing special value overwrites", () => {
    const moveStep = fakeNumericMoveStepCeleryScript;
    const currentLocationNode: SpecialValue = {
      kind: "special_value",
      args: { label: "current_location" }
    };
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: { axis: "x", axis_operand: currentLocationNode },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: { axis: "y", axis_operand: currentLocationNode },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "y",
        axis_operand: { kind: "special_value", args: { label: "safe_height" } },
      },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "special_value", args: { label: "soil_height" } },
      },
    });
    moveStep.body && moveStep.body.push({
      kind: "axis_overwrite",
      args: {
        axis: "z",
        axis_operand: { kind: "special_value", args: { label: "other" } },
      },
    });
    const botPosition = { x: 1, y: undefined, z: 3 };
    const resourceIndex = buildResourceIndex([]).index;
    const coordinate = computeCoordinate({
      step: moveStep,
      botPosition,
      resourceIndex,
      sequenceUuid: "seqUuid",
    });
    expect(coordinate).toEqual({ x: 1, y: 0, z: 0 });
  });
});
