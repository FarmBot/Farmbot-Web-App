let mockIsDesktop = false;
jest.mock("../../../screen_size", () => ({
  isDesktop: () => mockIsDesktop,
}));

jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper, shallow } from "enzyme";
import {
  fakeSequence, fakeTool, fakeToolSlot,
} from "../../../__test_support__/fake_state/resources";
import {
  Coordinate, Identifier, MoveAbsolute, Point, PointGroup, Tool,
} from "farmbot";
import {
  fakeHardwareFlags, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { overwrite } from "../../../api/crud";
import { cloneDeep } from "lodash";

describe("<TileMoveAbsolute />", () => {
  const fakeProps = (): StepParams<MoveAbsolute> => {
    const step: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: { kind: "coordinate", args: { x: 1.1, y: 2, z: 3 } },
        speed: 100,
        offset: { kind: "coordinate", args: { x: 4.4, y: 5, z: 6 } }
      }
    };
    const sequence = fakeSequence({ body: [step] });
    return {
      ...fakeStepParams(step),
      currentSequence: sequence,
      hardwareFlags: fakeHardwareFlags(),
    };
  };

  function checkField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: ReactWrapper<any>,
    position: number,
    label: string,
    value: string | number,
  ) {
    expect(block.find("label").at(position - 3).text().toLowerCase())
      .toEqual(label);
    expect(block.find("input").at(position + 1).props().value)
      .toEqual(value);
  }

  it("renders inputs", () => {
    const block = mount(<TileMoveAbsolute {...fakeProps()} />);
    block.setState({ more: true });
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(8);
    expect(labels.length).toEqual(4);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Move To");
    expect(buttons.at(0).text()).toEqual("Coordinate (1.1, 2, 3)");
    expect(block.find("input").at(1).props().value).toEqual("1.1");
    expect(block.find("input").at(2).props().value).toEqual("2");
    expect(block.find("input").at(3).props().value).toEqual("3");
    checkField(block, 6, "speed (%)", 100);
    checkField(block, 3, "x-offset", "4.4");
    checkField(block, 4, "y-offset", "5");
    checkField(block, 5, "z-offset", "6");
  });

  it("disables x-offset", () => {
    const p = fakeProps();
    const toolSlot = fakeToolSlot();
    toolSlot.body.gantry_mounted = true;
    toolSlot.body.tool_id = 1;
    const tool = fakeTool();
    tool.body.id = 1;
    p.resources = buildResourceIndex([toolSlot, tool]).index;
    const toolKind: Tool = { kind: "tool", args: { tool_id: 1 } };
    p.currentStep.args.location = toolKind;
    const block = mount(<TileMoveAbsolute {...p} />);
    const xOffsetInput = block.find("input").at(1);
    expect(xOffsetInput.props().name).toEqual("offset-x");
    expect(xOffsetInput.props().disabled).toBeTruthy();
    const yOffsetInput = block.find("input").at(2);
    expect(yOffsetInput.props().name).toEqual("offset-y");
    expect(yOffsetInput.props().disabled).toBeFalsy();
  });

  it("renders options on wide screens", () => {
    const p = fakeProps();
    mockIsDesktop = true;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.find("h4").text()).toEqual("Options  []");
  });

  it("doesn't render options on narrow screens", () => {
    const p = fakeProps();
    mockIsDesktop = false;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.find("h4").text()).toEqual("[]");
  });

  it("expands form", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(false);
    wrapper.find("h4").simulate("click");
    expect(wrapper.state().more).toEqual(true);
  });

  it("expands form by default", () => {
    const p = fakeProps();
    p.expandStepOptions = true;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(true);
  });

  it("expands form when offset is present", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args.z = 100;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(true);
  });

  it("not expanding form when speed is 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(false);
  });

  it("expands form when speed is not 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 50;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(true);
  });

  it("returns correct node", () => {
    const p = fakeProps();
    p.currentStep.args.location = {
      kind: "identifier",
      args: { label: "label" },
    };
    const block = new TileMoveAbsolute(p);
    expect(block.celeryNode).toEqual({
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: {
          kind: "identifier",
          args: { label: "label" },
        }
      }
    });
  });

  describe("updateInputValue()", () => {
    it("updates input value", () => {
      const block = new TileMoveAbsolute(fakeProps());
      const mock = jest.fn();
      block.updateArgs = mock;
      const cb = block.updateInputValue("x", "location");
      cb(inputEvent("23.456"));
      expect(mock.mock.calls[0][0].location.args.x).toBe(23.456);
    });
  });

  describe("updateArgs()", () => {
    it("updates args", () => {
      const p = fakeProps();
      const block = new TileMoveAbsolute(p);
      const location: Coordinate = {
        kind: "coordinate", args: { x: 4, y: 5, z: 6 }
      };
      block.updateArgs({ location });
      const expected = cloneDeep(p.currentSequence.body);
      p.currentStep.args.location = location;
      expected.body = [p.currentStep];
      expect(overwrite).toHaveBeenCalledWith(p.currentSequence, expected);
    });

    it("handles missing body", () => {
      const p = fakeProps();
      p.currentSequence.body.body = undefined;
      const block = new TileMoveAbsolute(p);
      block.updateArgs({});
      expect(overwrite).not.toHaveBeenCalled();
    });
  });

  describe("updateLocation()", () => {
    it.each<[string, Tool | Coordinate | Point | Identifier | PointGroup]>([
      ["tool", { kind: "tool", args: { tool_id: 1 } }],
      ["empty", { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }],
      ["point", {
        kind: "point",
        args: { pointer_type: "GenericPointer", pointer_id: 1 }
      }],
      ["identifier", { kind: "identifier", args: { label: "label" } }],
      ["point_group", { kind: "point_group", args: { point_group_id: 1 } }],
    ])("handles %s selection", (_kind, location) => {
      const block = new TileMoveAbsolute(fakeProps());
      block.updateArgs = jest.fn();
      block.updateLocation({
        kind: "parameter_application",
        args: { label: "label", data_value: location },
      });
      location.kind == "point_group"
        ? expect(block.updateArgs).not.toHaveBeenCalled()
        : expect(block.updateArgs).toHaveBeenCalledWith({ location });
    });

    it("changes variable", () => {
      const p = fakeProps();
      const block = new TileMoveAbsolute(p);
      const wrapper = shallow(<block.LocationForm />);
      wrapper.props().onChange({
        kind: "parameter_application",
        args: {
          label: "label", data_value: {
            kind: "identifier", args: { label: "label" }
          }
        }
      });
      const expected = cloneDeep(p.currentSequence.body);
      p.currentStep.args.location = {
        kind: "identifier",
        args: { label: "label" },
      };
      expected.body = [p.currentStep];
      expect(overwrite).toHaveBeenCalledWith(p.currentSequence, expected);
    });
  });
});
