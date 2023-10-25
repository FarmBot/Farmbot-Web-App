import React from "react";
import { mount } from "enzyme";
import { PinnedSequences } from "../pinned_sequence_list";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { PinnedSequencesProps } from "../interfaces";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";

describe("<PinnedSequences />", () => {
  const fakeProps = (): PinnedSequencesProps => ({
    syncStatus: undefined,
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.pinned = true;
    p.sequences = [sequence];
    const wrapper = mount(<PinnedSequences {...p} />);
    expect(wrapper.text()).toContain("Run");
  });
});
