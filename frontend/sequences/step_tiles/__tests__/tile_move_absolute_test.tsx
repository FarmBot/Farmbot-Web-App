import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount, ReactWrapper } from "enzyme";
import {
  fakeSequence, fakePoint, fakeTool
} from "../../../__test_support__/fake_state/resources";
import {
  MoveAbsolute, Point, Coordinate, Tool, ParameterApplication
} from "farmbot";
import {
  fakeHardwareFlags
} from "../../../__test_support__/sequence_hardware_settings";
import { emptyState } from "../../../resources/reducer";
import { inputEvent } from "../../../__test_support__/fake_input_event";
import { StepParams } from "../../interfaces";

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

  it("updates input value", () => {
    const tma = ordinaryMoveAbs();
    const mock = jest.fn();
    tma.updateArgs = mock;
    const cb = tma.updateInputValue("x", "location");
    cb(inputEvent("23.456"));
    expect(mock.mock.calls[0][0].location.args.x).toBe(23.456);
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

    it("does not handle every_point nodes", () => {
      const p = fakeProps();
      const block = ordinaryMoveAbs(p);
      const data_value = {
        kind: "every_point",
        args: { every_point_type: "Plant" }
        // tslint:disable-next-line:no-any
      } as any;
      const boom = () => block.updateLocation({
        kind: "parameter_application",
        args: { label: "parent", data_value }
      });
      expect(boom).toThrowError("Can't put `every_point` into `move_abs");
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
