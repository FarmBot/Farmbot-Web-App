import { fakeSequence } from "../../../__test_support__/fake_state/resources";
const mockSequence = fakeSequence();
jest.mock("../../../resources/selectors_by_id", () => ({
  findSequenceById: () => mockSequence,
}));

const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({
  editStep: mockEditStep,
}));

import React from "react";
import { TileExecute } from "../tile_execute";
import { mount, shallow } from "enzyme";
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

describe("<TileExecute />", () => {
  it("renders inputs", () => {
    const block = mount(<TileExecute {...fakeProps()} />);
    const inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(block.text()).toContain("Select a sequence");
  });

  it("renders inputs when sequence has a variable", () => {
    const p = fakeProps();
    const block = mount(<TileExecute {...p} />);
    const inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(block.text()).toContain("Select a sequence");
  });

  it("renders description", () => {
    const p = fakeProps();
    mockSequence.body.id = 1;
    p.currentStep.args.sequence_id = mockSequence.body.id;
    mockSequence.body.description = "description";
    const block = shallow(<TileExecute {...p} />);
    expect(block.find(StepWrapper).props().helpText).toEqual("description");
  });

  it("renders fallback", () => {
    const p = fakeProps();
    mockSequence.body.description = "";
    const block = shallow(<TileExecute {...p} />);
    expect(block.find(StepWrapper).props().helpText)
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
    const block = mount<TileExecute>(<TileExecute {...p} />);
    expect(block.html().toLowerCase()).toContain("placeholder=\"pinned sequence");
  });

  it("selects sequence", () => {
    const p = fakeProps();
    const block = mount<TileExecute>(<TileExecute {...p} />);
    block.instance().changeSelection({ label: "", value: 10 });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 10 }
    });
  });

  it("handles string value", () => {
    const p = fakeProps();
    const block = mount<TileExecute>(<TileExecute {...p} />);
    block.instance().changeSelection({ label: "", value: "10" });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "execute", args: { sequence_id: 0 }
    });
  });

  it("doesn't show location selection dropdowns", () => {
    const p = fakeProps();
    p.currentStep.args.sequence_id = 0;
    const wrapper = shallow(<TileExecute {...p} />);
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
    const wrapper = shallow(<TileExecute {...p} />);
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
    const wrapper = mount(<TileExecute {...p} />);
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
    const wrapper = shallow(<TileExecute {...p} />);
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
