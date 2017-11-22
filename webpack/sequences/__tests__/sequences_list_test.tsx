import * as React from "react";
import { mount } from "enzyme";
import { SequencesList } from "../sequences_list";
import { auth } from "../../__test_support__/fake_state/token";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("<SequencesList />", () => {
  function mountComponent(dispatch: Function) {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.name = "Sequence 1";
    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.name = "Sequence 2";
    const wrapper = mount(<SequencesList
      dispatch={dispatch}
      auth={auth}
      sequence={undefined}
      sequences={[fakeSequence1, fakeSequence2]} />);
    return {
      wrapper,
      fakeSequence1,
      fakeSequence2
    };
  }

  it("renders list", () => {
    const wrapper = mountComponent(jest.fn()).wrapper;
    expect(wrapper.find("input").first().props().placeholder)
      .toContain("Search Sequences");
    ["Sequence 1", "Sequence 2"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("has correct drag data", () => {
    const dispatch = jest.fn();
    const componentData = mountComponent(dispatch);
    const seq = componentData.wrapper.find("div").last();
    expect(seq.text()).toEqual("Sequence 2");
    seq.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
    const [[{ type, payload }]] = dispatch.mock.calls;
    expect(type).toEqual("PUT_DATA_XFER");
    expect(payload.value.args.sequence_id)
      .toEqual(componentData.fakeSequence2.body.id);
    expect(payload.value.kind).toEqual("execute");
  });
});
