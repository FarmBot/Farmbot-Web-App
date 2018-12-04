import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper } from "enzyme";
import { fakeSequence, fakePoint, fakeTool } from "../../../__test_support__/fake_state/resources";
import { MoveAbsolute, SequenceBodyItem } from "farmbot/dist";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { SpecialStatus } from "farmbot";
import { fakeHardwareFlags } from "../../../__test_support__/sequence_hardware_settings";
import { emptyState } from "../../../resources/reducer";
import {
  convertDropdownToLocation,
  SequenceMeta,
  MoveAbsDropDownContents
} from "../../../resources/sequence_meta";
import { set } from "lodash";

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

  function ordinaryMoveAbs() {
    const p = fakeProps();
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
    expect(labels.at(0).text().toLowerCase()).toEqual("import coordinates from");
    expect(buttons.at(0).text()).toEqual("None");
    checkField(block, 1, "x (mm)", "1.1");
    checkField(block, 2, "y (mm)", "2");
    checkField(block, 3, "z (mm)", "3");
    checkField(block, 4, "speed (%)", 100);
    checkField(block, 5, "x-offset", "4.4");
    checkField(block, 6, "y-offset", "5");
    checkField(block, 7, "z-offset", "6");
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

  describe("updateArgs", () => {
    it("is a work in progress", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs({});
      expect(tma.props.dispatch).toHaveBeenCalled();
      const payload =
        expect.objectContaining({ uuid: tma.props.currentSequence.uuid });
      const action =
        expect.objectContaining({ type: "OVERWRITE_RESOURCE", payload });
      expect(tma.props.dispatch).toHaveBeenCalledWith(action);
      debugger;
    });
  });

  describe("handleSelect", () => {
    it("handles empty selections", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs = jest.fn();
      tma.handleSelect({ kind: "None", body: undefined });
      const location = { kind: "coordinate", args: { x: 0, y: 0, z: 0, } };
      expect(tma.updateArgs).toHaveBeenCalledWith({ location });
    });

    it("handles point / tool selections", () => {
      const tma = ordinaryMoveAbs();
      tma.updateArgs = jest.fn();
      [fakePoint(), fakeTool()].map(selection => {
        tma.handleSelect(selection);
        const location = convertDropdownToLocation(selection);
        expect(tma.updateArgs).toHaveBeenCalledWith({ location });
      });
    });

    it("handles bound / unbound variables", () => {
      const tma = ordinaryMoveAbs();
      set(tma.props, "dispatch", jest.fn());
      const x: MoveAbsDropDownContents = {
        kind: "BoundVariable",
        body: { celeryNode: { args: {} } } as SequenceMeta
      };
      tma.handleSelect(x);
      expect(tma.props.dispatch).toHaveBeenCalled();
      const action = expect.objectContaining({ type: "OVERWRITE_RESOURCE" });
      expect(tma.props.dispatch).toHaveBeenCalledWith(action);
    });
  });
});
