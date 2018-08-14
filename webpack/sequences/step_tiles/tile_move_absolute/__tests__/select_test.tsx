jest.mock("../format_selected_dropdown", () => {
  return {
    formatSelectedDropdown: jest.fn(() => [])
  };
});

import * as React from "react";
import { shallow } from "enzyme";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { SequenceBodyItem } from "farmbot";
import { TileMoveAbsSelect } from "../select";
import { TileMoveAbsProps } from "../interfaces";
import { formatSelectedDropdown } from "../format_selected_dropdown";

function fakeSequenceStepProps(currentStep: SequenceBodyItem) {
  const currentSequence = fakeSequence();
  currentSequence.body.body = [currentStep];

  return {
    resources: buildResourceIndex([currentSequence]).index,
    currentSequence,
    currentStep,
    dispatch: jest.fn(),
    index: 0
  };
}

describe("<TileMoveAbsSelect/>", () => {
  function fakeProps(): TileMoveAbsProps {
    return {
      resources: buildResourceIndex().index,
      selectedItem: {
        kind: "tool",
        args: { tool_id: 123 }
      },
      onChange: jest.fn(),
      shouldDisplay: jest.fn(() => true)
    };
  }

  it("renders", () => {
    const props = fakeProps();
    const el = shallow(<TileMoveAbsSelect {...props} />);
    el.simulate("change", { label: "test ddi", value: 123, headingId: "tool" });
    expect(props.onChange)
      .toHaveBeenCalledWith({ kind: "coordinate", args: { x: 0, y: 0, z: 0 } });
  });
});
