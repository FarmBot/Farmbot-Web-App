jest.mock("../../history", () => ({
  push: jest.fn(),
  history: { getCurrentLocation: () => ({ pathname: "" }) }
}));

jest.mock("../actions", () => ({
  selectSequence: jest.fn()
}));

jest.mock("../../api/crud", () => ({
  init: jest.fn()
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { SequencesList } from "../sequences_list";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { SequencesListProps } from "../interfaces";
import { Actions } from "../../constants";
import { init } from "../../api/crud";
import { push } from "../../history";
import { selectSequence } from "../actions";
import { resourceUsageList } from "../../resources/in_use";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { resourceReducer } from "../../resources/reducer";
import { resourceReady } from "../../sync/actions";

describe("<SequencesList />", () => {
  const fakeSequences = () => {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Sequence 1";
    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Sequence 2";
    return [fakeSequence1, fakeSequence2];
  };

  const fakeProps = (sequences = fakeSequences()): SequencesListProps => {
    const { inUse } = resourceReducer(buildResourceIndex(sequences),
      resourceReady("Sequence", sequences)).index;
    return {
      resourceUsage: resourceUsageList(inUse),
      dispatch: jest.fn(),
      sequence: undefined,
      sequences,
      sequenceMetas: {},
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
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Sequence 1";
    fakeSequence1.body.id = 1;

    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Sequence 2";
    fakeSequence2.body.id = 2;
    fakeSequence2.body.body =
      [{ kind: "execute", args: { sequence_id: fakeSequence1.body.id } }];

    const p = fakeProps([fakeSequence1, fakeSequence2]);

    const wrapper = mount(<SequencesList {...p} />);
    expect(wrapper.find(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const p = fakeProps();
    const wrapper = mount(<SequencesList {...p} />);
    expect(wrapper.find(".in-use").length).toEqual(0);
  });

  it("adds new sequence", () => {
    const wrapper = mount(<SequencesList {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(init).toHaveBeenCalledWith("Sequence",
      expect.objectContaining({ body: [] }));
    expect(push).toHaveBeenCalledWith("/app/sequences/new_sequence_2");
  });

  it("sets search term", () => {
    const wrapper = shallow<SequencesList>(<SequencesList {...fakeProps()} />);
    expect(wrapper.instance().state.searchTerm).toEqual("");
    const searchField = wrapper.find("input").first();
    expect(searchField.props().placeholder)
      .toEqual("Search Sequences...");
    searchField.simulate("change", {
      currentTarget: { value: "search this" }
    });
    expect(wrapper.instance().state.searchTerm).toEqual("search this");
  });

  it("opens sequence", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequencesList {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(selectSequence).toHaveBeenCalledWith(p.sequences[0].uuid);
  });
});
