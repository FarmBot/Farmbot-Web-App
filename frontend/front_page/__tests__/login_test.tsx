import React from "react";
import { mount, shallow } from "enzyme";
import { Login, LoginProps } from "../login";
import { changeBlurableInput } from "../../__test_support__/helpers";

describe("<Login />", () => {
  const fakeProps = (): LoginProps => ({
    email: undefined,
    onToggleForgotPassword: jest.fn(),
    onSubmit: jest.fn(),
    onEmailChange: jest.fn(),
    onLoginPasswordChange: jest.fn(),
  });

  it("shows login options", () => {
    const p = fakeProps();
    const wrapper = mount(<Login {...p} />);
    ["Email", "Password", "Forgot password?", "Login"]
      .map(string => expect(wrapper.text()).toContain(string));
    changeBlurableInput(wrapper, "email", 1);
    expect(p.onEmailChange).toHaveBeenCalledWith(
      { currentTarget: { value: "email" } });
    const input = shallow(wrapper.find("input").at(2).getElement());
    input.simulate("change", { target: { value: "password" } });
    input.simulate("blur", { currentTarget: { value: "password" } });
    expect(p.onLoginPasswordChange).toHaveBeenCalledWith(
      { currentTarget: { value: "password" } });
    wrapper.find("a").first().simulate("click");
    expect(p.onToggleForgotPassword).toHaveBeenCalled();
  });

  it("submits", () => {
    const p = fakeProps();
    const wrapper = shallow(<Login {...p} />);
    const e = { persist: jest.fn(), preventDefault: jest.fn() };
    jest.useFakeTimers();
    wrapper.find("form").simulate("submit", e);
    expect(e.persist).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
    jest.runAllTimers();
    expect(p.onSubmit).toHaveBeenCalledWith(e);
  });
});
