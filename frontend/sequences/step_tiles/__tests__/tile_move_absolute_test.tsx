import React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { render } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
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
import { ExpandableHeader } from "../../../ui/expandable_header";

jest.mock("@blueprintjs/core", () => ({
  ...jest.requireActual("@blueprintjs/core"),
  Collapse: (props: { isOpen: boolean, children: React.ReactNode }) =>
    props.isOpen ? <>{props.children}</> : <></>,
}));

let overwriteSpy: jest.SpyInstance;
let isDesktopSpy: jest.SpyInstance;
let originalInnerWidth = window.innerWidth;

const setInnerWidth = (innerWidth: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: innerWidth,
  });
};

beforeEach(() => {
  originalInnerWidth = window.innerWidth;
  setInnerWidth(1024);
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => window.innerWidth >= 768);
});

afterEach(() => {
  setInnerWidth(originalInnerWidth);
  overwriteSpy.mockRestore();
  isDesktopSpy.mockRestore();
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

  it("renders inputs", () => {
    const { container } = render(<TileMoveAbsolute {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toBeGreaterThanOrEqual(5);
    expect(labels.length).toBeGreaterThanOrEqual(4);
    expect((container.querySelector("input[name='offset-x']") as HTMLInputElement)
      .value).toEqual("4.4");
    expect((container.querySelector("input[name='offset-y']") as HTMLInputElement)
      .value).toEqual("5");
    expect((container.querySelector("input[name='offset-z']") as HTMLInputElement)
      .value).toEqual("6");
    expect((container.textContent || "").toLowerCase()).toContain("speed");
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
    const block = new TileMoveAbsolute(p);
    expect(block.gantryMounted).toBeTruthy();
    const xOffset = block.OffsetInput("x") as React.ReactElement<{
      children: [React.ReactNode, React.ReactElement<{ disabled: boolean }>];
    }>;
    expect(xOffset.props.children[1].props.disabled).toBeTruthy();
    const yOffset = block.OffsetInput("y") as React.ReactElement<{
      children: [React.ReactNode, React.ReactElement<{ disabled: boolean }>];
    }>;
    expect(yOffset.props.children[1].props.disabled).toBeFalsy();
  });

  it("renders options on wide screens", () => {
    const p = fakeProps();
    isDesktopSpy.mockReturnValue(true);
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    const header = rendered.root.findByType(ExpandableHeader);
    expect(header.props.title).toEqual("Options");
  });

  it("doesn't render options on narrow screens", () => {
    const p = fakeProps();
    isDesktopSpy.mockReturnValue(false);
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    const header = rendered.root.findByType(ExpandableHeader);
    expect(header.props.title).toEqual("");
  });

  it("expands form", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    const header = rendered.root.findByType(ExpandableHeader);
    expect(header.props.expanded).toBeFalsy();
    header.props.onClick();
    expect(rendered.root.findByType(ExpandableHeader).props.expanded).toBeTruthy();
  });

  it("expands form by default", () => {
    const p = fakeProps();
    p.expandStepOptions = true;
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    expect(rendered.root.findByType(ExpandableHeader).props.expanded).toBeTruthy();
  });

  it("expands form when offset is present", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args.z = 100;
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    expect(rendered.root.findByType(ExpandableHeader).props.expanded).toBeTruthy();
  });

  it("not expanding form when speed is 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 100;
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    expect(rendered.root.findByType(ExpandableHeader).props.expanded).toBeFalsy();
  });

  it("expands form when speed is not 100", () => {
    const p = fakeProps();
    p.expandStepOptions = false;
    p.currentStep.args.offset.args = { x: 0, y: 0, z: 0 };
    p.currentStep.args.speed = 50;
    const rendered = TestRenderer.create(<TileMoveAbsolute {...p} />);
    expect(rendered.root.findByType(ExpandableHeader).props.expanded).toBeTruthy();
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
