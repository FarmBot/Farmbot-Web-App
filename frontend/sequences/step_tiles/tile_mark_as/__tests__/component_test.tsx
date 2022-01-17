const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({ editStep: mockEditStep }));

let mockShouldDisplay = false;
jest.mock("../../../../devices/should_display", () => ({
  shouldDisplayFeature: () => mockShouldDisplay,
}));

import React from "react";
import { mount } from "enzyme";
import { MarkAs } from "../component";
import { UpdateResourceValue } from "../interfaces";
import { UpdateResource, Identifier, Resource, resource_type } from "farmbot";
import {
  fakePlant, fakeWeed,
} from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { editStep } from "../../../../api/crud";
import { NOTHING_SELECTED } from "../../../step_button_cluster";
import { StepParams } from "../../../interfaces";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

describe("<MarkAs/>", () => {
  beforeEach(() => { mockShouldDisplay = false; });

  const plant = fakePlant();
  plant.body.id = 1;
  const weed = fakeWeed();
  weed.body.id = 2;

  const fakeProps = (): StepParams<UpdateResource> => ({
    ...fakeStepParams(
      ResourceUpdateResourceStep("Device", 1, "mounted_tool_id", 0)),
    resources: buildResourceIndex([plant, weed]).index,
  });

  it("renders the basic parts", () => {
    const wrapper = mount(<MarkAs {...fakeProps()} />);
    ["Mark", "Tool Mount", "property", "Mounted Tool", "as", "None"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("resets step", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    wrapper.instance().resetStep();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual({
      kind: "update_resource",
      args: { resource: NOTHING_SELECTED },
      body: [],
    });
  });

  it("edits step", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    wrapper.setState({
      resource: {
        kind: "resource",
        args: { resource_type: "Plant", resource_id: 1 }
      },
      fieldsAndValues: [{ field: "plant_stage", value: "planted" }],
    });
    wrapper.instance().commitSelection();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(
      ResourceUpdateResourceStep("Plant", 1, "plant_stage", "planted"));
  });

  it("doesn't edit step", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    wrapper.setState({
      resource: { kind: "nothing", args: {} },
      fieldsAndValues: [{ field: "plant_stage", value: "planted" }],
    });
    wrapper.instance().commitSelection();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(
      ResourceUpdateResourceStep("Device", 1, "mounted_tool_id", 0));
  });

  it("doesn't save partial pairs", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    wrapper.setState({
      resource: {
        kind: "resource",
        args: { resource_type: "Plant", resource_id: 1 }
      },
      fieldsAndValues: [
        { field: "plant_stage", value: "planted" },
        { field: "x", value: 1 },
        { field: "y", value: undefined },
      ],
    });
    wrapper.instance().commitSelection();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    const expectedStep =
      ResourceUpdateResourceStep("Plant", 1, "plant_stage", "planted");
    expectedStep.body && expectedStep.body.push({
      kind: "pair", args: { label: "x", value: 1 }
    });
    expect(p.currentStep).toEqual(expectedStep);
  });

  it("edits step to use identifier", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    wrapper.setState({
      resource: { kind: "identifier", args: { label: "var" } },
      fieldsAndValues: [{ field: "plant_stage", value: "planted" }],
    });
    wrapper.instance().commitSelection();
    expect(editStep).toHaveBeenCalled();
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep).toEqual(
      IdentifierUpdateResourceStep("var", "plant_stage", "planted"));
  });

  it("updates resource", () => {
    const p = fakeProps();
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    expect(wrapper.state().resource).toEqual(p.currentStep.args.resource);
    expect(wrapper.state().fieldsAndValues)
      .toEqual([{ field: "mounted_tool_id", value: 0 }]);
    const newResource: Resource =
      ({ kind: "resource", args: { resource_type: "Weed", resource_id: 2 } });
    wrapper.instance().updateResource(newResource);
    expect(wrapper.state().resource).toEqual(newResource);
    expect(wrapper.state().fieldsAndValues)
      .toEqual([{ field: undefined, value: undefined }]);
  });

  it("updates field", () => {
    const p = fakeProps();
    p.currentStep.body = undefined;
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    expect(wrapper.state().fieldsAndValues)
      .toEqual([{ field: undefined, value: undefined }]);
    wrapper.instance().updateFieldOrValue(0)({ field: "plant_stage" });
    expect(wrapper.state().fieldsAndValues)
      .toEqual([{ field: "plant_stage", value: undefined }]);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("updates value", () => {
    const p = fakeProps();
    p.currentStep.body && p.currentStep.body.push({
      kind: "pair", args: { label: "plant_stage", value: "planned" }
    });
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "mounted_tool_id", value: 0 },
      { field: "plant_stage", value: "planned" },
    ]);
    const callback = jest.fn();
    wrapper.instance().updateFieldOrValue(1)({ value: "planted" }, callback);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "mounted_tool_id", value: 0 },
      { field: "plant_stage", value: "planted" },
    ]);
    expect(callback).toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("adds planted at now", () => {
    mockShouldDisplay = true;
    const p = fakeProps();
    p.currentStep.body = [{
      kind: "pair", args: { label: "plant_stage", value: "planned" }
    }];
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "plant_stage", value: "planned" },
    ]);
    const callback = jest.fn();
    wrapper.instance().updateFieldOrValue(0)({ value: "planted" }, callback);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "plant_stage", value: "planted" },
      { field: "planted_at", value: "{{ timeNow }}" },
    ]);
    expect(callback).toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("removes planted at now", () => {
    mockShouldDisplay = true;
    const p = fakeProps();
    p.currentStep.body = [
      { kind: "pair", args: { label: "plant_stage", value: "planted" } },
      { kind: "pair", args: { label: "planted_at", value: "{{ timeNow }}" } },
    ];
    const wrapper = mount<MarkAs>(<MarkAs {...p} />);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "plant_stage", value: "planted" },
      { field: "planted_at", value: "{{ timeNow }}" },
    ]);
    const callback = jest.fn();
    wrapper.instance().updateFieldOrValue(0)({ value: "planned" }, callback);
    expect(wrapper.state().fieldsAndValues).toEqual([
      { field: "plant_stage", value: "planned" },
    ]);
    expect(callback).toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});

const BaseUpdateResourceStep =
  (resource: Resource | Identifier,
    field: string,
    value: UpdateResourceValue,
  ): UpdateResource => ({
    kind: "update_resource",
    args: { resource },
    body: [{ kind: "pair", args: { label: field, value } }],
  });

const ResourceUpdateResourceStep = (
  resourceType: resource_type,
  resourceId: number,
  field: string,
  value: UpdateResourceValue,
): UpdateResource =>
  BaseUpdateResourceStep({
    kind: "resource",
    args: { resource_id: resourceId, resource_type: resourceType }
  }, field, value);

const IdentifierUpdateResourceStep = (
  label: string,
  field: string,
  value: UpdateResourceValue,
): UpdateResource =>
  BaseUpdateResourceStep({ kind: "identifier", args: { label } }, field, value);
