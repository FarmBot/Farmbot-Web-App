import * as React from "react";
import { shallow } from "enzyme";
import { Login, LoginProps } from "../login";

describe("<Login/>", () => {
  it("shows server options when `showServerOpts` is set", () => {
    const p: LoginProps = {
      /** Attributes */
      email: undefined,
      loginPassword: undefined,
      serverURL: undefined,
      serverPort: undefined,

      /** Flags */
      showServerOpts: true,

      /** Callbacks */
      onToggleForgotPassword: jest.fn(),
      onToggleServerOpts: jest.fn(),
      onSubmit: jest.fn(),
      onEmailChange: jest.fn(),
      onLoginPasswordChange: jest.fn(),
      onServerURLChange: jest.fn(),
      onServerPortChange: jest.fn(),
    };
    const wrapper = shallow(<Login {...p} />);
    expect(wrapper.html()).toContain("Server URL");
  });
});
