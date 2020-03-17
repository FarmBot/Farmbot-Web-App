import * as React from "react";
import { shallow } from "enzyme";
import {
  BlurablePassword,
  BPProps,
} from "../blurable_password";

describe("<BlurablePassword />", () => {
  const fakeProps = (): BPProps => {
    return { onCommit: jest.fn() };
  };

  it("triggers callbacks", () => {
    const p = fakeProps();
    const wrapper = shallow<BlurablePassword>(<BlurablePassword {...p} />);
    expect(p.onCommit).not.toHaveBeenCalled();
    const fakeEvent1 = { target: { value: "hello!" } };
    wrapper.simulate("change", fakeEvent1);
    wrapper.update();
    expect(wrapper.instance().state.value).toBe(fakeEvent1.target.value);
    fakeEvent1.target.value = "goodbye!";
    wrapper.simulate("blur", fakeEvent1);
    wrapper.update();
    expect(p.onCommit).toHaveBeenCalledWith(fakeEvent1);
  });
});
