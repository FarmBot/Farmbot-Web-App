import React from "react";
import { mount } from "enzyme";
import { SequenceSelectBox, SequenceSelectBoxProps } from "../sequence_select_box";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { findSequenceById, selectAllSequences } from "../../resources/selectors";

describe("<SequenceSelectBox />", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  const fakeProps = (): SequenceSelectBoxProps => {
    return {
      onChange: jest.fn(),
      resources: buildResourceIndex([]).index,
      sequenceId: 0
    };
  };

  const fakeRIWithSequences = () => {
    const fakeSequence1 = fakeSequence();
    const fakeSequence2 = fakeSequence();
    return {
      index: buildResourceIndex([fakeSequence1, fakeSequence2]).index,
      list: [
        { label: fakeSequence1.body.name, value: fakeSequence1.body.id as number },
        { label: fakeSequence2.body.name, value: fakeSequence2.body.id as number },
      ],
    };
  };

  it("renders", () => {
    const wrapper = mount(<SequenceSelectBox {...fakeProps()} />);
    expect(wrapper.text()).toEqual("Select a sequence");
  });

  it("returns list: none selected", () => {
    const p = fakeProps();
    const sequences = fakeRIWithSequences();
    p.resources = sequences.index;
    const result = SequenceSelectBox(p);
    const expected = selectAllSequences(sequences.index)
      .map(({ body }) => ({ label: body.name, value: body.id as number }));
    expect(result.props.list).toEqual(expected);
    expect(result.props.selectedItem).toEqual(undefined);
  });

  it("returns list: one selected", () => {
    const p = fakeProps();
    const sequences = fakeRIWithSequences();
    p.resources = sequences.index;
    const selectedId = selectAllSequences(sequences.index)[0]?.body.id as number;
    if (!selectedId) { throw new Error("Expected at least one sequence option"); }
    p.sequenceId = selectedId;
    const result = SequenceSelectBox(p);
    expect(result.props.list.every((item: { value: number }) =>
      item.value != selectedId)).toBeTruthy();
    const selected = findSequenceById(sequences.index, selectedId).body;
    expect(result.props.selectedItem).toEqual({
      label: selected.name,
      value: selected.id,
    });
  });
});
