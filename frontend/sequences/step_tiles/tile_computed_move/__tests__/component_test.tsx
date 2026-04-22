const mockEditStep = jest.fn();

import React from "react";
import { render } from "@testing-library/react";
import { ComputedMove } from "../component";
import { Move, SpecialValue } from "farmbot";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";
import * as crud from "../../../../api/crud";
import { LocSelection, AxisSelection } from "../interfaces";
import {
  fakeNumericMoveStepCeleryScript, fakeNumericMoveStepState,
  fakeLuaMoveStepCeleryScript, fakeLuaMoveStepState,
} from "../test_fixtures";
import { inputEvent } from "../../../../__test_support__/fake_html_events";
import { StepParams } from "../../../interfaces";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";

let editStepSpy: jest.SpyInstance;

beforeEach(() => {
  mockEditStep.mockClear();
  editStepSpy = jest.spyOn(crud, "editStep")
    .mockImplementation(mockEditStep as never);
});

afterEach(() => {
  editStepSpy.mockRestore();
});

const setStateSync = (instance: ComputedMove) => {
  instance.setState = ((state, callback) => {
    const update = typeof state == "function"
      ? state(instance.state, instance.props)
      : state;
    instance.state = { ...instance.state, ...update };
    callback?.();
  });
  return instance;
};

describe("<ComputedMove />", () => {
  const fakeProps = (): StepParams<Move> => {
    const currentStep: Move = { kind: "move", args: {} };
    return {
      ...fakeStepParams(currentStep),
      hardwareFlags: fakeHardwareFlags(),
      expandStepOptions: false,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<ComputedMove {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("location");
  });

  it("deconstructs step: numeric", () => {
    const p = fakeProps();
    p.currentStep = fakeNumericMoveStepCeleryScript;
    const instance = new ComputedMove(p);
    expect(instance.state).toEqual(fakeNumericMoveStepState);
  });

  it("deconstructs step: lua", () => {
    const p = fakeProps();
    p.currentStep = fakeLuaMoveStepCeleryScript;
    const instance = new ComputedMove(p);
    expect(instance.state).toEqual(fakeLuaMoveStepState);
  });

  it("constructs step: numeric", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setState(fakeNumericMoveStepState);
    instance.update();
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(fakeNumericMoveStepCeleryScript);
  });

  it("constructs step: lua", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setState(fakeLuaMoveStepState);
    instance.update();
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(fakeLuaMoveStepCeleryScript);
  });

  it("constructs step: empty", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.update();
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "move", args: {}, body: [] });
  });

  it("constructs step: axes disabled", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setState(fakeNumericMoveStepState);
    instance.setState({
      selection: {
        x: AxisSelection.disable,
        y: AxisSelection.disable,
        z: AxisSelection.disable,
      }
    });
    instance.update();
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    const currentLocationNode: SpecialValue = {
      kind: "special_value",
      args: { label: "current_location" }
    };
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [
        {
          kind: "axis_overwrite",
          args: { axis: "x", axis_operand: currentLocationNode }
        },
        {
          kind: "axis_overwrite",
          args: { axis: "y", axis_operand: currentLocationNode }
        },
        {
          kind: "axis_overwrite",
          args: { axis: "z", axis_operand: currentLocationNode }
        },
        { kind: "safe_z", args: {} },
      ]
    });
  });

  it("shows options", () => {
    const MORE = ["offset", "variance", "order"];
    const { container, rerender } = render(<ComputedMove {...fakeProps()} />);
    MORE.map(string =>
      expect(container.textContent?.toLowerCase()).not.toContain(string));
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setState({ more: true });
    rerender(instance.render());
    MORE.map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("shows options: axis order", () => {
    const MORE = ["order"];
    const p = fakeProps();
    p.currentStep = {
      kind: "move", args: {}, body: [{
        kind: "axis_order", args: { grouping: "xyz", route: "high" }
      }],
    };
    const { container } = render(<ComputedMove {...p} />);
    MORE.map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("enables additional option display", () => {
    const instance = setStateSync(new ComputedMove(fakeProps()));
    expect(instance.state.more).toEqual(false);
    instance.toggleMore();
    expect(instance.state.more).toEqual(true);
  });

  it("enables safe z", () => {
    const instance = setStateSync(new ComputedMove(fakeProps()));
    expect(instance.state.axisGrouping).toEqual(undefined);
    expect(instance.state.axisRoute).toEqual(undefined);
    expect(instance.state.safeZ).toEqual(false);
    instance.setAxisOrder({ label: "", value: "safe_z" });
    expect(instance.state.safeZ).toEqual(true);
    expect(instance.state.axisGrouping).toEqual(undefined);
    expect(instance.state.axisRoute).toEqual(undefined);
  });

  it("enables axis order", () => {
    const instance = setStateSync(new ComputedMove(fakeProps()));
    expect(instance.state.axisGrouping).toEqual(undefined);
    expect(instance.state.axisRoute).toEqual(undefined);
    expect(instance.state.safeZ).toEqual(false);
    instance.setAxisOrder({ label: "", value: "xyz;high" });
    expect(instance.state.safeZ).toEqual(false);
    expect(instance.state.axisGrouping).toEqual("xyz");
    expect(instance.state.axisRoute).toEqual("high");
  });

  it("handles config", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.default_axis_order = "safe_z";
    p.resources = buildResourceIndex([config]).index;
    const instance = new ComputedMove(p);
    instance.setState({ more: true });
    const row = instance.AxisOrderInputRow();
    expect([undefined, "safe_z"]).toContain(row?.props.defaultValue);
  });

  it("commits number value", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    expect(instance.state.offset.x).toEqual(undefined);
    instance.commit("offset", "x")(inputEvent("1"));
    expect(instance.state.offset.x).toEqual(1);
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [{
        kind: "axis_addition", args: {
          axis: "x",
          axis_operand: { kind: "numeric", args: { number: 1 } }
        }
      }]
    });
  });

  it("commits string value", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setState({ offset: { x: "0", y: undefined, z: undefined } });
    instance.commit("offset", "x")(inputEvent("1"));
    expect(instance.state.offset.x).toEqual("1");
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [{
        kind: "axis_addition", args: {
          axis: "x",
          axis_operand: { kind: "lua", args: { lua: "1" } }
        }
      }]
    });
  });

  it("updates location", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setLocationState({
      locationNode: { kind: "identifier", args: { label: "variable" } },
      locationSelection: LocSelection.identifier,
    });
    expect(instance.state.location).toEqual({
      kind: "identifier", args: { label: "variable" }
    });
    expect(instance.state.locationSelection).toEqual(LocSelection.identifier);
    expect(instance.state.selection)
      .toEqual({ x: undefined, y: undefined, z: undefined });
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    const identifier = { kind: "identifier", args: { label: "variable" } };
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [
        { kind: "axis_overwrite", args: { axis: "x", axis_operand: identifier } },
        { kind: "axis_overwrite", args: { axis: "y", axis_operand: identifier } },
        { kind: "axis_overwrite", args: { axis: "z", axis_operand: identifier } },
      ]
    });
  });

  it("updates overwrite", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setAxisOverwriteState("x", AxisSelection.custom);
    expect(instance.state.selection)
      .toEqual({ x: AxisSelection.custom, y: undefined, z: undefined });
    expect(instance.state.overwrite)
      .toEqual({ x: 0, y: undefined, z: undefined });
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [{
        kind: "axis_overwrite", args: {
          axis: "x",
          axis_operand: { kind: "numeric", args: { number: 0 } }
        }
      }]
    });
  });

  it("updates axis", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setAxisState("variance", "x", 0)(1);
    expect(instance.state.variance)
      .toEqual({ x: 1, y: undefined, z: undefined });
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [{
        kind: "axis_addition", args: {
          axis: "x",
          axis_operand: { kind: "random", args: { variance: 1 } }
        }
      }]
    });
  });

  it("updates axis to default", () => {
    const p = fakeProps();
    const instance = setStateSync(new ComputedMove(p));
    instance.setAxisState("variance", "x", 1000)(undefined);
    expect(instance.state.variance)
      .toEqual({ x: 1000, y: undefined, z: undefined });
    expect(crud.editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "move", args: {}, body: [{
        kind: "axis_addition", args: {
          axis: "x",
          axis_operand: { kind: "random", args: { variance: 1000 } }
        }
      }]
    });
  });
});
