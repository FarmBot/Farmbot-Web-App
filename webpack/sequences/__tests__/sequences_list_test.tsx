import * as React from "react";
import { mount } from "enzyme";
import { SequencesList } from "../sequences_list";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("<SequencesList />", () => {
  it("renders list", () => {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Sequence 1";
    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Sequence 2";
    const wrapper = mount(<SequencesList
      dispatch={jest.fn()}
      auth={auth}
      sequence={undefined}
      sequences={[fakeSequence1, fakeSequence2]} />);
    expect(wrapper.find("input").first().props().placeholder)
      .toContain("Search Sequences");
    ["Sequence 1", "Sequence 2"].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
