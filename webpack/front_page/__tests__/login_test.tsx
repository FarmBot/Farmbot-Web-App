import * as React from "react";
import { shallow } from "enzyme";
import { Login, LoginProps } from "../login";

describe("<Login/>", () => {
  const fakeProps = (): LoginProps => ({
    /** Attributes */
    email: undefined,
    /** Callbacks */
    onToggleForgotPassword: jest.fn(),
    onSubmit: jest.fn(),
    onEmailChange: jest.fn(),
    onLoginPasswordChange: jest.fn(),
  });

  it("shows login options when rendering", () => {
    const wrapper = shallow(<Login {...fakeProps()} />);
    const html = wrapper.html();
    // TODO: This component needs much better tests.
    //       I am just here to remove legacy refs to `serverOpts` prop,
    //       but this could use some attention. -RC
    expect(html).toContain("Forgot password?");
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
