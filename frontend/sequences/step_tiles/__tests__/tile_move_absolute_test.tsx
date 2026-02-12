let mockIsDesktop = false;

import React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { fireEvent, render } from "@testing-library/react";
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
import * as crud from "../../../api/crud";
import { cloneDeep } from "lodash";
import * as screenSize from "../../../screen_size";

let isDesktopSpy: jest.SpyInstance;
let overwriteSpy: jest.SpyInstance;

beforeEach(() => {
  mockIsDesktop = false;
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => mockIsDesktop);
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
});

afterEach(() => {
  isDesktopSpy.mockRestore();
  overwriteSpy.mockRestore();
});

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

  const normalizedText = (element: Element | null) =>
    (element?.textContent || "").replace(/\u00A0/g, " ").trim();

  function checkField(
    labels: NodeListOf<Element>,
    inputs: NodeListOf<HTMLInputElement>,
    position: number,
    label: string,
    value: string | number,
  ) {
    expect(labels[position - 3].textContent?.toLowerCase())
      .toEqual(label);
    expect(inputs[position + 1]?.value)
      .toEqual(value.toString());
  }

  it("renders inputs", () => {
    const { container } = render(<TileMoveAbsolute {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(8);
    expect(labels.length).toEqual(4);
    expect(buttons.length).toEqual(1);
    expect(inputs[0]?.placeholder).toEqual("Move To");
    expect(buttons[0]?.textContent).toEqual("Coordinate (1.1, 2, 3)");
    expect(inputs[1]?.value).toEqual("1.1");
    expect(inputs[2]?.value).toEqual("2");
    expect(inputs[3]?.value).toEqual("3");
    checkField(labels, inputs as NodeListOf<HTMLInputElement>, 6, "speed (%)", 100);
    checkField(labels, inputs as NodeListOf<HTMLInputElement>, 3, "x-offset", "4.4");
    checkField(labels, inputs as NodeListOf<HTMLInputElement>, 4, "y-offset", "5");
    checkField(labels, inputs as NodeListOf<HTMLInputElement>, 5, "z-offset", "6");
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
    const { container } = render(<TileMoveAbsolute {...p} />);
    const xOffsetInput =
      container.querySelector("input[name='offset-x']") as HTMLInputElement;
    expect(xOffsetInput.name).toEqual("offset-x");
    expect(xOffsetInput.disabled).toBeTruthy();
    const yOffsetInput =
      container.querySelector("input[name='offset-y']") as HTMLInputElement;
    expect(yOffsetInput.name).toEqual("offset-y");
    expect(yOffsetInput.disabled).toBeFalsy();
  });

  it("renders options on wide screens", () => {
    const p = fakeProps();
    mockIsDesktop = true;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(normalizedText(container.querySelector("h4"))).toEqual("Options  []");
  });

  it("doesn't render options on narrow screens", () => {
    const p = fakeProps();
    mockIsDesktop = false;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(normalizedText(container.querySelector("h4"))).toEqual("[]");
  });

  it("expands form", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(container.querySelector(".fa-plus")).not.toBeNull();
    const header = container.querySelector("h4");
    expect(header).not.toBeNull();
    fireEvent.click(header as Element);
    expect(container.querySelector(".fa-minus")).not.toBeNull();
  });

  it("expands form by default", () => {
    const p = fakeProps();
    p.expandStepOptions = true;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(container.querySelector(".fa-minus")).not.toBeNull();
  });

  it("expands form when offset is present", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args.z = 100;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(container.querySelector(".fa-minus")).not.toBeNull();
  });

  it("not expanding form when speed is 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(container.querySelector(".fa-plus")).not.toBeNull();
  });

  it("expands form when speed is not 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 50;
    const { container } = render(<TileMoveAbsolute {...p} />);
    expect(container.querySelector(".fa-minus")).not.toBeNull();
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
      expect(crud.overwrite).toHaveBeenCalledWith(p.currentSequence, expected);
    });

    it("handles missing body", () => {
      const p = fakeProps();
      p.currentSequence.body.body = undefined;
      const block = new TileMoveAbsolute(p);
      block.updateArgs({});
      expect(crud.overwrite).not.toHaveBeenCalled();
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
      const form = block.LocationForm() as React.ReactElement<{
        onChange: (variable: Identifier) => void;
      }>;
      form.props.onChange({
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
      expect(crud.overwrite).toHaveBeenCalledWith(p.currentSequence, expected);
    });
  });
});
