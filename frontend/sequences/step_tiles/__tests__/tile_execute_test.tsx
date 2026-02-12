import { fakeSequence } from "../../../__test_support__/fake_state/resources";
let mockSequence = fakeSequence();
jest.mock("../../../resources/selectors_by_id", () => ({
  findSequenceById: () => mockSequence,
}));

const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({
  editStep: mockEditStep,
}));

import React from "react";
import { TileExecute } from "../tile_execute";
import { render } from "@testing-library/react";
import { Execute, ParameterApplication, Coordinate } from "farmbot";
import { LocalsList } from "../../locals_list/locals_list";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { StepWrapper } from "../../step_ui";
import { ToolTips } from "../../../constants";

const coordinate = (x = 0, y = 0, z = 0): Coordinate =>
  ({ kind: "coordinate", args: { x, y, z } });

const fakeProps = (): StepParams<Execute> => ({
  ...fakeStepParams({ kind: "execute", args: { sequence_id: 0 } }),
});

const findByType = (
  node: React.ReactNode,
  type: unknown,
): React.ReactElement | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findByType(child, type);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement(node)) {
    if (node.type === type) { return node; }
    return findByType(node.props.children, type);
  }
  return undefined;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockEditStep.mockClear();
  mockSequence = fakeSequence();
});

afterAll(() => {
  jest.unmock("../../../resources/selectors_by_id");
  jest.unmock("../../../api/crud");
});

describe("<TileExecute />", () => {
  it("renders inputs", () => {
    const { container } = render(<TileExecute {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(1);
    expect((inputs[0] as HTMLInputElement).placeholder)
      .toEqual("Execute Sequence");
    expect(container.textContent).toContain("Select a sequence");
  });

  it("renders inputs when sequence has a variable", () => {
    const p = fakeProps();
    const { container } = render(<TileExecute {...p} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(1);
    expect((inputs[0] as HTMLInputElement).placeholder)
      .toEqual("Execute Sequence");
    expect(container.textContent).toContain("Select a sequence");
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
    expect(container.innerHTML.toLowerCase())
      .toContain("placeholder=\"pinned sequence");
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
    const variable = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    const localsList = findByType(element, LocalsList);
    localsList?.props.onChange(variable);
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
    expect(container.innerHTML).toContain("Coordinate (10, 20, 30)");
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
    const variable = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    const localsList = findByType(element, LocalsList);
    localsList?.props.onChange(variable);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 1 },
      body: [existingVariable, variable]
    });
  });
});
