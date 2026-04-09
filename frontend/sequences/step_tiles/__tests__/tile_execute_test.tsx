import { fakeSequence } from "../../../__test_support__/fake_state/resources";
let mockSequence = fakeSequence();

const mockEditStep = jest.fn();

import React from "react";
import { TileExecute } from "../tile_execute";
import { render } from "@testing-library/react";
import { Execute, ParameterApplication, Coordinate } from "farmbot";
import { LocalsList } from "../../locals_list/locals_list";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { StepWrapper } from "../../step_ui";
import { ToolTips } from "../../../constants";
import * as crud from "../../../api/crud";
import * as selectorsById from "../../../resources/selectors_by_id";

const coordinate = (x = 0, y = 0, z = 0): Coordinate =>
  ({ kind: "coordinate", args: { x, y, z } });

const fakeProps = (): StepParams<Execute> => ({
  ...fakeStepParams({ kind: "execute", args: { sequence_id: 0 } }),
});

// eslint-disable-next-line comma-spacing
const findByType = <P,>(
  node: React.ReactNode,
  type: React.ComponentType<P>,
): React.ReactElement<P> | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of React.Children.toArray(node)) {
      const found = findByType(child, type);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement(node)) {
    if (node.type === type) {
      return node as React.ReactElement<P>;
    }
    const elementWithChildren = node as React.ReactElement<{
      children?: React.ReactNode;
    }>;
    return findByType(elementWithChildren.props.children, type);
  }
  return undefined;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(crud, "editStep").mockImplementation(mockEditStep);
  jest.spyOn(selectorsById, "findSequenceById")
    .mockImplementation(() => mockSequence as never);
  mockEditStep.mockClear();
  mockSequence = fakeSequence();
});


describe("<TileExecute />", () => {
  it("renders inputs", () => {
    const { container } = render(<TileExecute {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
    const wrapper = container.querySelector(".execute-step");
    expect(wrapper?.className.includes("no-inputs")).toBeTruthy();
    expect(wrapper?.className.includes("sequence-selected")).toBeFalsy();
  });

  it("renders inputs when sequence has a variable", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    p.resources.sequenceMetas[mockSequence.uuid] = {
      label: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "label", default_value: coordinate()
          }
        },
        dropdown: { label: "Label", value: "label" },
        vector: undefined,
      }
    };
    const { container } = render(<TileExecute {...p} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
    const wrapper = container.querySelector(".execute-step");
    expect(wrapper?.className.includes("no-inputs")).toBeFalsy();
    expect(wrapper?.className.includes("sequence-selected")).toBeTruthy();
  });

  it("renders description", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    mockSequence.body.description = "description";
    const element = new TileExecute(p).render();
    const wrapper = findByType(element, StepWrapper);
    expect(wrapper?.props.helpText).toEqual("description");
  });

  it("renders fallback", () => {
    const p = fakeProps();
    mockSequence.body.description = "";
    const element = new TileExecute(p).render();
    const wrapper = findByType(element, StepWrapper);
    expect(wrapper?.props.helpText)
      .toEqual(ToolTips.EXECUTE_SEQUENCE);
  });

  it("renders pinned sequence step", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    p.resources.sequenceMetas[mockSequence.uuid] = {
      parent1: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent1", default_value: coordinate()
          }
        },
        dropdown: { label: "Parent1", value: "parent1" },
        vector: undefined,
      }
    };
    mockSequence.body.pinned = true;
    mockSequence.body.name = "Pinned Sequence";
    const { container } = render(<TileExecute {...p} />);
    const hasPinnedClass = !!container.querySelector(".execute-step.pinned");
    expect(hasPinnedClass).toBeTruthy();
  });

  it("selects sequence", () => {
    const p = fakeProps();
    const tileExecute = new TileExecute(p);
    tileExecute.changeSelection({ label: "", value: 10 });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 10 }
    });
  });

  it("handles string value", () => {
    const p = fakeProps();
    const tileExecute = new TileExecute(p);
    tileExecute.changeSelection({ label: "", value: "10" });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 0 }
    });
  });

  it("doesn't show location selection dropdowns", () => {
    const p = fakeProps();
    p.currentStep.args.sequence_id = 0;
    const element = new TileExecute(p).render();
    expect(findByType(element, LocalsList)).toBeUndefined();
  });

  it("selects a location", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    p.resources.sequenceMetas[mockSequence.uuid] = {
      parent1: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent1", default_value: coordinate()
          }
        },
        dropdown: { label: "Parent1", value: "parent1" },
        vector: undefined,
      }
    };
    const element = new TileExecute(p).render();
    const variable: ParameterApplication = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    const localsList = findByType(element, LocalsList);
    localsList?.props.onChange(variable, variable.args.label);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 1 }, body: [variable]
    });
  });

  it("shows a parameter application", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    p.currentStep.body = [{
      kind: "parameter_application", args: {
        label: "label", data_value: coordinate(10, 20, 30)
      }
    }];
    p.resources.sequenceMetas[mockSequence.uuid] = {
      "label": {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "label", default_value: coordinate()
          }
        },
        dropdown: { label: "Label", value: "label" },
        vector: undefined,
      }
    };
    const { container } = render(<TileExecute {...p} />);
    const html = container.innerHTML;
    const hasCoordinateSummary = html.includes("Coordinate (10, 20, 30)");
    const hasCoordinateInputs =
      html.includes("name=\"location-x\"")
      && html.includes("name=\"location-y\"")
      && html.includes("name=\"location-z\"")
      && html.includes("value=\"10\"")
      && html.includes("value=\"20\"")
      && html.includes("value=\"30\"");
    expect(hasCoordinateSummary || hasCoordinateInputs).toBeTruthy();
  });

  it("keeps previous parameter applications", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    const existingVariable: ParameterApplication = {
      kind: "parameter_application", args: {
        label: "parent0", data_value: coordinate(10, 20, 30)
      }
    };
    p.currentStep.body = [existingVariable];
    p.resources.sequenceMetas[mockSequence.uuid] = {
      "label": {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "label", default_value: coordinate()
          }
        },
        dropdown: { label: "Label", value: "label" },
        vector: undefined,
      }
    };
    const element = new TileExecute(p).render();
    const variable: ParameterApplication = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    const localsList = findByType(element, LocalsList);
    localsList?.props.onChange(variable, variable.args.label);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 1 },
      body: [existingVariable, variable]
    });
  });
});
