const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { mount, shallow } from "enzyme";
import { ComputedMove } from "../component";
import { Move, SpecialValue } from "farmbot";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";
import { editStep } from "../../../../api/crud";
import { LocSelection, AxisSelection } from "../interfaces";
import {
  fakeNumericMoveStepCeleryScript, fakeNumericMoveStepState,
  fakeLuaMoveStepCeleryScript, fakeLuaMoveStepState,
} from "../test_fixtures";
import { inputEvent } from "../../../../__test_support__/fake_html_events";
import { StepParams } from "../../../interfaces";

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
    const wrapper = mount<ComputedMove>(<ComputedMove {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("location");
  });

  it("deconstructs step: numeric", () => {
    const p = fakeProps();
    p.currentStep = fakeNumericMoveStepCeleryScript;
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    expect(wrapper.state()).toEqual(fakeNumericMoveStepState);
  });

  it("deconstructs step: lua", () => {
    const p = fakeProps();
    p.currentStep = fakeLuaMoveStepCeleryScript;
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    expect(wrapper.state()).toEqual(fakeLuaMoveStepState);
  });

  it("constructs step: numeric", () => {
    const p = fakeProps();
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.setState(fakeNumericMoveStepState);
    wrapper.instance().update();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(fakeNumericMoveStepCeleryScript);
  });

  it("constructs step: lua", () => {
    const p = fakeProps();
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.setState(fakeLuaMoveStepState);
    wrapper.instance().update();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(fakeLuaMoveStepCeleryScript);
  });

  it("constructs step: empty", () => {
    const p = fakeProps();
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.instance().update();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({ kind: "move", args: {}, body: [] });
  });

  it("constructs step: axes disabled", () => {
    const p = fakeProps();
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.setState(fakeNumericMoveStepState);
    wrapper.setState({
      selection: {
        x: AxisSelection.disable,
        y: AxisSelection.disable,
        z: AxisSelection.disable,
      }
    });
    wrapper.instance().update();
    expect(editStep).toHaveBeenCalled();
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
    const MORE = ["offset", "variance", "safe"];
    const wrapper = mount<ComputedMove>(<ComputedMove {...fakeProps()} />);
    MORE.map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string));
    wrapper.setState({ more: true });
    MORE.map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("enables additional option display", () => {
    const wrapper = shallow<ComputedMove>(<ComputedMove {...fakeProps()} />);
    expect(wrapper.state().more).toEqual(false);
    wrapper.instance().toggleMore();
    expect(wrapper.state().more).toEqual(true);
  });

  it("enables safe z", () => {
    const wrapper = shallow<ComputedMove>(<ComputedMove {...fakeProps()} />);
    expect(wrapper.state().safeZ).toEqual(false);
    wrapper.instance().toggleSafeZ();
    expect(wrapper.state().safeZ).toEqual(true);
  });

  it("commits number value", () => {
    const p = fakeProps();
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    expect(wrapper.state().offset.x).toEqual(undefined);
    wrapper.instance().commit("offset", "x")(inputEvent("1"));
    expect(wrapper.state().offset.x).toEqual(1);
    expect(editStep).toHaveBeenCalled();
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
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.setState({ offset: { x: "0", y: undefined, z: undefined } });
    wrapper.instance().commit("offset", "x")(inputEvent("1"));
    expect(wrapper.state().offset.x).toEqual("1");
    expect(editStep).toHaveBeenCalled();
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
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.instance().setLocationState({
      locationNode: { kind: "identifier", args: { label: "variable" } },
      locationSelection: LocSelection.identifier,
    });
    expect(wrapper.state().location).toEqual({
      kind: "identifier", args: { label: "variable" }
    });
    expect(wrapper.state().locationSelection).toEqual(LocSelection.identifier);
    expect(wrapper.state().selection)
      .toEqual({ x: undefined, y: undefined, z: undefined });
    expect(editStep).toHaveBeenCalled();
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
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.instance().setAxisOverwriteState("x", AxisSelection.custom);
    expect(wrapper.state().selection)
      .toEqual({ x: AxisSelection.custom, y: undefined, z: undefined });
    expect(wrapper.state().overwrite)
      .toEqual({ x: 0, y: undefined, z: undefined });
    expect(editStep).toHaveBeenCalled();
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
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.instance().setAxisState("variance", "x", 0)(1);
    expect(wrapper.state().variance)
      .toEqual({ x: 1, y: undefined, z: undefined });
    expect(editStep).toHaveBeenCalled();
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
    const wrapper = shallow<ComputedMove>(<ComputedMove {...p} />);
    wrapper.instance().setAxisState("variance", "x", 1000)(undefined);
    expect(wrapper.state().variance)
      .toEqual({ x: 1000, y: undefined, z: undefined });
    expect(editStep).toHaveBeenCalled();
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
