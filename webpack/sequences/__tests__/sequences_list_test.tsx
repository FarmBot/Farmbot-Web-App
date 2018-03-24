import * as React from "react";
import { mount } from "enzyme";
import { SequencesList } from "../sequences_list";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { SequencesListProps } from "../interfaces";
import { Actions } from "../../constants";

describe("<SequencesList />", () => {
  const fakeProps = (): SequencesListProps => {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Sequence 1";
    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Sequence 2";
    return {
      dispatch: jest.fn(),
      auth,
      sequence: undefined,
      sequences: [fakeSequence1, fakeSequence2]
    };
  };

  it("renders list", () => {
    const p = fakeProps();
    const wrapper = mount(<SequencesList {...p} />);
    expect(wrapper.find("input").first().props().placeholder)
      .toContain("Search Sequences");
    ["Sequence 1", "Sequence 2"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("has correct drag data", () => {
    const p = fakeProps();
    const wrapper = mount(<SequencesList {...p} />);
    const seq = wrapper.find("div").last();
    expect(seq.text()).toEqual("Sequence 2");
    seq.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.PUT_DATA_XFER,
      payload: expect.objectContaining({
        value: {
          kind: "execute",
          args: { sequence_id: p.sequences[1].body.id },
        }
      })
    });
  });

  it("shows in-use indicator", () => {
    const p = fakeProps();
    p.sequences[0].body.in_use = true;
    const wrapper = mount(<SequencesList {...p} />);
    expect(wrapper.find(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const wrapper = mount(<SequencesList {...fakeProps()} />);
    expect(wrapper.find(".in-use").length).toEqual(0);
  });
});
