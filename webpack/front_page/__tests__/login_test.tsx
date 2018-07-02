import * as React from "react";
import { shallow } from "enzyme";
import { Login, LoginProps } from "../login";

describe("<Login/>", () => {
  it("shows login options when rendering", () => {
    const p: LoginProps = {
      /** Attributes */
      email: undefined,
      /** Callbacks */
      onToggleForgotPassword: jest.fn(),
      onSubmit: jest.fn(),
      onEmailChange: jest.fn(),
      onLoginPasswordChange: jest.fn(),
    };
    const wrapper = shallow(<Login {...p} />);
    const html = wrapper.html();
    // TODO: This component needs much better tests.
    //       I am just here to remove legacy refs to `serverOpts` prop,
    //       but this could use some attention. -RC
    expect(html).toContain("Forgot password?");
  });
});
