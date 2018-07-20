jest.mock("farmbot-toastr", () => ({ error: jest.fn() }));

import * as React from "react";
import { shallow } from "enzyme";
import { BlurableInput, BIProps } from "../blurable_input";
import { error } from "farmbot-toastr";

describe("<BlurableInput />", () => {
  const fakeProps = (): BIProps => {
    return {
      onCommit: jest.fn(),
      value: "",
    };
  };

  it("focuses", () => {
    const p = fakeProps();
    p.value = "1";
    const wrapper = shallow<BlurableInput>(<BlurableInput {...p} />);
    wrapper.find("input").simulate("focus");
    expect(wrapper.instance().state.buffer).toEqual("1");
    expect(wrapper.instance().state.isEditing).toEqual(true);
  });

  it("out of bounds: under", () => {
    const p = fakeProps();
    p.type = "number";
    p.min = 0;
    const wrapper = shallow<BlurableInput>(<BlurableInput {...p} />);
    wrapper.setState({ buffer: "-100" });
    wrapper.find("input").simulate("submit");
    expect(wrapper.instance().state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be greater than or equal to 0.");
  });

  it("out of bounds: over", () => {
    const p = fakeProps();
    p.type = "number";
    p.max = 100;
    const wrapper = shallow<BlurableInput>(<BlurableInput {...p} />);
    wrapper.setState({ buffer: "101" });
    wrapper.find("input").simulate("submit");
    expect(wrapper.instance().state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be less than or equal to 100.");
  });
});
