import React from "react";
import { SequenceEditorMiddle } from "../sequence_editor_middle";
import { mount } from "enzyme";
import { SequenceEditorMiddleProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { emptyState } from "../../resources/reducer";

describe("<SequenceEditorMiddle/>", () => {
  function fakeProps(): SequenceEditorMiddleProps {
    return {
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      sequences: [],
      resources: buildResourceIndex().index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareData: fakeFarmwareData(),
      getWebAppConfigValue: jest.fn(),
      sequencesState: emptyState().consumers.sequences,
    };
  }

  it("active editor", () => {
    const wrapper = mount(<SequenceEditorMiddle {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("run");
  });

  it("inactive editor", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = mount(<SequenceEditorMiddle {...p} />);
    expect(wrapper.text()).toContain("No Sequence selected");
  });
});
