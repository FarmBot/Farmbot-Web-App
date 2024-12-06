import React from "react";
import { mount } from "enzyme";
import { SequenceSelectBox, SequenceSelectBoxProps } from "../sequence_select_box";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("<SequenceSelectBox />", () => {
  const fakeProps = (): SequenceSelectBoxProps => {
    return {
      onChange: jest.fn(),
      resources: buildResourceIndex([]).index,
      sequenceId: 0
    };
  };

  const fakeRIWithSequences = () => {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Fake 1";
    fakeSequence1.body.id = 1;
    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Fake 2";
    fakeSequence2.body.id = 2;
    return buildResourceIndex([fakeSequence1, fakeSequence2]).index;
  };

  it("renders", () => {
    const wrapper = mount(<SequenceSelectBox {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Select a sequence");
  });

  it("returns list: none selected", () => {
    const p = fakeProps();
    p.resources = fakeRIWithSequences();
    const result = SequenceSelectBox(p);
    expect(result.props.list).toEqual([
      { label: "Fake 1", value: 1 },
      { label: "Fake 2", value: 2 },
    ]);
    expect(result.props.selectedItem).toEqual(undefined);
  });

  it("returns list: one selected", () => {
    const p = fakeProps();
    p.sequenceId = 1;
    p.resources = fakeRIWithSequences();
    const result = SequenceSelectBox(p);
    expect(result.props.list).toEqual([
      { label: "Fake 2", value: 2 },
    ]);
    expect(result.props.selectedItem).toEqual(
      { label: "Fake 1", value: 1 });
  });
});
