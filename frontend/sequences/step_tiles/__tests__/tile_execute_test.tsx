import { fakeSequence } from "../../../__test_support__/fake_state/resources";
const mockSequence = fakeSequence();
jest.mock("../../../resources/selectors_by_id", () => ({
  findSequenceById: () => mockSequence,
}));

const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({
  editStep: mockEditStep,
}));

import * as React from "react";
import {
  ExecuteBlock,
  ExecBlockParams,
  RefactoredExecuteBlock,
} from "../tile_execute";
import { mount, shallow } from "enzyme";
import { Execute, ParameterApplication, Coordinate } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { LocalsList } from "../../locals_list/locals_list";

const coordinate = (x = 0, y = 0, z = 0): Coordinate =>
  ({ kind: "coordinate", args: { x, y, z } });

function fakeProps(): ExecBlockParams {
  const currentStep: Execute = {
    kind: "execute",
    args: { sequence_id: 0 }
  };
  return {
    currentSequence: fakeSequence(),
    currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    shouldDisplay: () => false,
    confirmStepDeletion: false,
  };
}

describe("<ExecuteBlock/>", () => {
  it("renders inputs", () => {
    const block = mount(<ExecuteBlock {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(labels.at(0).text()).toEqual("Sequence");
    expect(block.text()).toContain("None");
  });

  it("renders inputs when sequence has a variable", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const block = mount(<ExecuteBlock {...p} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(labels.at(0).text()).toEqual("Sequence");
    expect(block.text()).toContain("None");
  });
});

describe("<RefactoredExecuteBlock />", () => {
  it("selects sequence", () => {
    const p = fakeProps();
    const block = mount<RefactoredExecuteBlock>(
      <RefactoredExecuteBlock {...p} />);
    block.instance().changeSelection({ label: "", value: 10 });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 10 }
    });
  });

  it("doesn't show location selection dropdowns", () => {
    const p = fakeProps();
    p.currentStep.args.sequence_id = 0;
    const wrapper = shallow(<RefactoredExecuteBlock {...p} />);
    expect(wrapper.find("LocalsList").length).toEqual(0);
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
    const wrapper = shallow(<RefactoredExecuteBlock {...p} />);
    const variable = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    wrapper.find(LocalsList).simulate("change", variable);
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
        label: "parent", data_value: coordinate(10, 20, 30)
      }
    }];
    p.resources.sequenceMetas[mockSequence.uuid] = {
      parent: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent", default_value: coordinate()
          }
        },
        dropdown: { label: "Parent", value: "parent" },
        vector: undefined,
      }
    };
    const wrapper = mount(<RefactoredExecuteBlock {...p} />);
    expect(wrapper.html()).toContain("Coordinate (10, 20, 30)");
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
      parent: {
        celeryNode: {
          kind: "parameter_declaration", args: {
            label: "parent", default_value: coordinate()
          }
        },
        dropdown: { label: "Parent", value: "parent" },
        vector: undefined,
      }
    };
    const wrapper = shallow(<RefactoredExecuteBlock {...p} />);
    const variable = {
      kind: "parameter_application", args: {
        label: "parent1", data_value: {
          kind: "identifier", args: { label: "parent2" }
        }
      }
    };
    wrapper.find(LocalsList).simulate("change", variable);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 1 },
      body: [existingVariable, variable]
    });
  });
});
