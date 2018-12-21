import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper } from "enzyme";
import {
  fakeSequence, fakePoint, fakeTool
} from "../../../__test_support__/fake_state/resources";
import {
  MoveAbsolute, SequenceBodyItem, Point, Coordinate, Tool, VariableDeclaration
} from "farmbot/dist";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { SpecialStatus } from "farmbot";
import {
  fakeHardwareFlags
} from "../../../__test_support__/sequence_hardware_settings";
import { emptyState } from "../../../resources/reducer";
import { findVariableByName } from "../../../resources/sequence_meta";
import { inputEvent } from "../../../__test_support__/fake_input_event";

describe("<TileMoveAbsolute/>", () => {
  const fakeProps = () => {
    const currentStep: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: {
          kind: "coordinate",
          args: {
            x: 1.1,
            y: 2,
            z: 3
          }
        },
        speed: 100,
        offset: {
          kind: "coordinate",
          args: {
            x: 4.4,
            y: 5,
            z: 6
          }
        }
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
    expect(block.find("input").at(position).props().value)
      .toEqual(value);
  }

  it("renders inputs", () => {
    const block = mount(<TileMoveAbsolute {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(8);
    expect(labels.length).toEqual(8);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Move Absolute");
    expect(buttons.at(0).text()).toEqual("Coordinate (1.1, 2, 3)");
    checkField(block, 1, "x (mm)", "1.1");
    checkField(block, 2, "y (mm)", "2");
    checkField(block, 3, "z (mm)", "3");
    checkField(block, 7, "speed (%)", 100);
    checkField(block, 4, "x-offset", "4.4");
    checkField(block, 5, "y-offset", "5");
    checkField(block, 6, "z-offset", "6");
  });

  it("retrieves a tool", () => {
    const index = buildResourceIndex([
      {
        kind: "Tool",
        uuid: "Tool.4.4",
        specialStatus: SpecialStatus.SAVED,
        body: {
          id: 4,
          name: "tool123"
        }
      }
    ]).index;
    const tool = index.references[Object.keys(index.byKind.Tool)[0]];
    if (!tool) { throw new Error("Impossible"); }

    const currentStep: SequenceBodyItem = {
      kind: "move_absolute",
      args: {
        location: { kind: "tool", args: { tool_id: tool.body.id || -1 } },
        speed: 100,
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
      }
    };

    const component = mount(<TileMoveAbsolute
      currentSequence={fakeSequence()}
      currentStep={currentStep}
      dispatch={jest.fn()}
      index={0}
      resources={index}
      confirmStepDeletion={false} />).instance() as TileMoveAbsolute;

    expect(component.tool).toEqual(tool);
  });

  const CONFLICT_TEXT_BASE = "Hardware setting conflict";

  it("doesn't show setting warning", () => {
    const p = fakeProps();
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("doesn't show warning: axis length 0", () => {
    const p = fakeProps();
    p.currentStep.args.offset.args.x = 10000;
    p.hardwareFlags.stopAtMax.x = true;
    p.hardwareFlags.axisLength.x = 0;
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).not.toContain(CONFLICT_TEXT_BASE);
  });

  it("shows warning: too high", () => {
    const p = fakeProps();
    p.currentStep.args.offset.args.x = 10000;
    p.hardwareFlags.stopAtMax.x = true;
    p.hardwareFlags.axisLength.x = 100;
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too high (negativeOnly)", () => {
    const p = fakeProps();
    p.currentStep.args.offset.args.x = -10000;
    p.hardwareFlags.stopAtMax.x = true;
    p.hardwareFlags.negativeOnly.x = true;
    p.hardwareFlags.axisLength.x = 100;
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too low (negativeOnly)", () => {
    const p = fakeProps();
    p.currentStep.args.offset.args.x = 10000;
    p.hardwareFlags.stopAtHome.x = true;
    p.hardwareFlags.negativeOnly.x = true;
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("shows warning: too low", () => {
    const p = fakeProps();
    p.currentStep.args.offset.args.x = -10000;
    p.hardwareFlags.stopAtHome.x = true;
    p.hardwareFlags.stopAtMax.x = true;
    const wrapper = mount(<TileMoveAbsolute {...p} />);
    expect(wrapper.text()).toContain(CONFLICT_TEXT_BASE + ": x");
  });

  it("updates input value", () => {
    const tma = ordinaryMoveAbs();
    const mock = jest.fn();
    tma.updateArgs = mock;
    const cb = tma.updateInputValue("x", "location");
    cb(inputEvent("23.456"));
    expect(mock.mock.calls[0][0].location.args.x).toBe(23.456);
  });

  it("renders x/y/z of `identifier` nodes", () => {
    const p = fakeProps();
    p.currentStep.args.location =
      ({ kind: "identifier", args: { label: "parent" } });
    p.currentSequence.body.args.locals.body = [
      {
        kind: "variable_declaration",
        args: {
          label: "parent",
          data_value: { kind: "coordinate", args: { x: 220, y: 330, z: 440 } }
        }
      }
    ];
    p.currentSequence.body.body = [p.currentStep];
    p.resources = buildResourceIndex([p.currentSequence]).index;
    expect(findVariableByName(p.resources, p.currentSequence.uuid, "parent"))
      .toBeTruthy();
    const tma = ordinaryMoveAbs(p);
    expect(tma.getAxisValue("z")).toBe("440");
  });

  it("renders x/y/z of `coordinate` nodes", () => {
    const p = fakeProps();
    const pointResource = fakePoint();
    pointResource.body.x = 987;
    const celeryPoint: Point = {
      kind: "point",
      args: { pointer_type: "Point", pointer_id: pointResource.body.id || 0 }
    };
    p.currentStep.args.location = celeryPoint;
    p.currentSequence.body.body = [p.currentStep];
    p.resources = buildResourceIndex([p.currentSequence, pointResource]).index;
    const tma = ordinaryMoveAbs(p);
    expect(tma.getAxisValue("x")).toBe("987");
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
        kind: "variable_declaration",
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
                pointer_type: selection.kind,
                pointer_id: selection.body.id || 0
              }
            };
          }
        };
        const variable: VariableDeclaration = {
          kind: "variable_declaration",
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
        kind: "variable_declaration",
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
