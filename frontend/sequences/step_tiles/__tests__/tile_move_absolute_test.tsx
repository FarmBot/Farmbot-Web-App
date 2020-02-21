import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper } from "enzyme";
import {
  fakeSequence, fakePoint, fakeTool, fakeToolSlot
} from "../../../__test_support__/fake_state/resources";
import {
  Coordinate,
  MoveAbsolute,
  ParameterApplication,
  Point,
  Tool,
} from "farmbot";
import {
  fakeHardwareFlags
} from "../../../__test_support__/fake_sequence_step_data";
import { emptyState } from "../../../resources/reducer";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { StepParams } from "../../interfaces";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";

describe("<TileMoveAbsolute/>", () => {
  const fakeProps = (): StepParams => {
    const currentStep: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: { kind: "coordinate", args: { x: 1.1, y: 2, z: 3 } },
        speed: 100,
        offset: { kind: "coordinate", args: { x: 4.4, y: 5, z: 6 } }
      }
    };
    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      hardwareFlags: fakeHardwareFlags(),
      confirmStepDeletion: false,
    };
  };

  function ordinaryMoveAbs(p = fakeProps()) {
    p.currentSequence.body.body = [p.currentStep];
    p.index = 0;
    p.dispatch = jest.fn();
    return new TileMoveAbsolute(p);
  }

  function checkField(
    block: ReactWrapper, position: number, label: string, value: string | number
  ) {
    expect(block.find("label").at(position).text().toLowerCase())
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
    expect(labels.length).toEqual(7);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Move To");
    expect(buttons.at(0).text()).toEqual("Coordinate (1.1, 2, 3)");
    checkField(block, 0, "x (mm)", "1.1");
    checkField(block, 1, "y (mm)", "2");
    checkField(block, 2, "z (mm)", "3");
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
    (p.currentStep as MoveAbsolute).args.location = toolKind;
    const block = mount(<TileMoveAbsolute {...p} />);
    const xOffsetInput = block.find("input").at(1);
    expect(xOffsetInput.props().name).toEqual("offset-x");
    expect(xOffsetInput.props().disabled).toBeTruthy();
    const yOffsetInput = block.find("input").at(2);
    expect(yOffsetInput.props().name).toEqual("offset-y");
    expect(yOffsetInput.props().disabled).toBeFalsy();
  });

  it("updates input value", () => {
    const tma = ordinaryMoveAbs();
    const mock = jest.fn();
    tma.updateArgs = mock;
    const cb = tma.updateInputValue("x", "location");
    cb(inputEvent("23.456"));
    expect(mock.mock.calls[0][0].location.args.x).toBe(23.456);
  });

  it("Options visible on greater screen width", () => {
    const p = fakeProps();
    Object.defineProperty(window, "innerWidth", {
      value: 800,
      configurable: true
    });
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.find("h4").text()).toEqual("Options  []");
  });

  it("Options not visible on small screen width like mobile", () => {
    const p = fakeProps();
    Object.defineProperty(window, "innerWidth", {
      value: 360,
      configurable: true
    });
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.find("h4").text()).toEqual("[]");
  });

  it("expands form", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    (p.currentStep as MoveAbsolute).args.offset.args = { x: 0, y: 0, z: 0 };
    (p.currentStep as MoveAbsolute).args.speed = 100;
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
    (p.currentStep as MoveAbsolute).args.offset.args.z = 100;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(true);
  });

  it("not expanding form when speed is 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    (p.currentStep as MoveAbsolute).args.offset.args = { x: 0, y: 0, z: 0 };
    (p.currentStep as MoveAbsolute).args.speed = 100;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(false);
  });

  it("expands form when speed is not 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    (p.currentStep as MoveAbsolute).args.offset.args = { x: 0, y: 0, z: 0 };
    (p.currentStep as MoveAbsolute).args.speed = 50;
    const wrapper = mount<TileMoveAbsolute>(<TileMoveAbsolute {...p} />);
    expect(wrapper.state().more).toEqual(true);
  });

  describe("updateArgs", () => {
    it("calls OVERWRITE_RESOURCE for the correct resource", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs({});
      expect(tma.props.dispatch).toHaveBeenCalled();
      const payload =
        expect.objectContaining({ uuid: tma.props.currentSequence.uuid });
      const action =
        expect.objectContaining({ type: "OVERWRITE_RESOURCE", payload });
      expect(tma.props.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe("updateLocation", () => {
    it("handles empty selections", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs = jest.fn();
      const location: Coordinate = {
        kind: "coordinate", args: { x: 0, y: 0, z: 0, }
      };
      tma.updateLocation({
        kind: "parameter_application",
        args: { label: "", data_value: location }
      });
      expect(tma.updateArgs).toHaveBeenCalledWith({ location });
    });

    it("handles point / tool selections", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs = jest.fn();
      [fakePoint(), fakeTool()].map(selection => {
        const data_value = (): Tool | Point => {
          switch (selection.kind) {
            case "Tool": return {
              kind: "tool", args: { tool_id: selection.body.id || 0 }
            };
            default: return {
              kind: "point", args: {
                pointer_type: selection.body.pointer_type,
                pointer_id: selection.body.id || 0
              }
            };
          }
        };
        const variable: ParameterApplication = {
          kind: "parameter_application",
          args: { label: "", data_value: data_value() }
        };
        tma.updateLocation(variable);
        expect(tma.updateArgs).toHaveBeenCalledWith({ location: data_value() });
      });
    });

    it("handles variables", () => {
      const p = fakeProps();
      const block = ordinaryMoveAbs(p);
      block.updateLocation({
        kind: "parameter_application",
        args: {
          label: "parent", data_value: {
            kind: "identifier", args: { label: "parent" }
          }
        }
      });
      expect(p.dispatch).toHaveBeenCalled();
      const action = expect.objectContaining({ type: "OVERWRITE_RESOURCE" });
      expect(p.dispatch).toHaveBeenCalledWith(action);
    });
  });
});
