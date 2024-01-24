import React from "react";
import { mount, shallow } from "enzyme";
import { Login, LoginProps } from "../login";

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
  });

  it("interacts with login options", () => {
    const p = fakeProps();
    const wrapper = shallow(<Login {...p} />);
    const e1 = { currentTarget: { value: "email" } };
    wrapper.find("input").first().simulate("change", e1);
    expect(p.onEmailChange).toHaveBeenCalledWith(e1);
    const e2 = { currentTarget: { value: "password" } };
    wrapper.find("input").last().simulate("change", e2);
    expect(p.onLoginPasswordChange).toHaveBeenCalledWith(e2);
    wrapper.find("a").first().simulate("click");
    expect(p.onToggleForgotPassword).toHaveBeenCalled();
  });

  it("submits", () => {
    const p = fakeProps();
    const wrapper = shallow(<Login {...p} />);
    wrapper.find("form").simulate("submit");
    expect(p.onSubmit).toHaveBeenCalled();
  });
});
