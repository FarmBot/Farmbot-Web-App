const mockEditStep = jest.fn();
jest.mock("../../../api/crud", () => ({
  editStep: mockEditStep
}));

import React from "react";
import { mount } from "enzyme";
import { TileOldMarkAs } from "../tile_old_mark_as";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { SequenceBodyItem } from "farmbot";
import { cloneDeep } from "lodash";

describe("<TileOldMarkAs />", () => {
  const currentStep = {
    kind: "resource_update",
    args: {
      resource_type: "Device",
      resource_id: 0,
      label: "mounted_tool_id",
      value: 0,
    }
  } as unknown as SequenceBodyItem;

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  });

  it("renders deprecation notice and convert button", () => {
    const p = fakeProps();
    const block = mount(<TileOldMarkAs {...p} />);
    expect(block.text()).toContain("deprecated");
    expect(block.text()).toContain("convert");
  });

  it("converts set mounted tool step", () => {
    const p = fakeProps();
    const block = mount(<TileOldMarkAs {...p} />);
    expect(block.text()).toContain("deprecated");
    expect(block.text()).toContain("convert");
    block.find("button").last().simulate("click");
    expect(editStep).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step).toEqual({
      kind: "update_resource",
      args: {
        resource: {
          kind: "resource",
          args: { resource_type: "Device", resource_id: 0 }
        }
      },
      body: [{
        kind: "pair", args: { label: "mounted_tool_id", value: 0 }
      }],
    });
  });

  it("converts remove weed step", () => {
    const p = fakeProps();
    p.currentStep = {
      kind: "resource_update",
      args: {
        resource_type: "Weed",
        resource_id: 123,
        label: "discarded_at",
        value: "?",
      }
    } as unknown as SequenceBodyItem;
    const block = mount(<TileOldMarkAs {...p} />);
    expect(block.text()).toContain("deprecated");
    expect(block.text()).toContain("convert");
    block.find("button").last().simulate("click");
    expect(editStep).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step).toEqual({
      kind: "update_resource",
      args: {
        resource: {
          kind: "resource",
          args: { resource_type: "Weed", resource_id: 123 }
        }
      },
      body: [{
        kind: "pair", args: { label: "plant_stage", value: "removed" }
      }],
    });
  });
});
