import React from "react";
import { ForgotPassword } from "../forgot_password";
import { shallow } from "enzyme";

describe("<ForgotPassword/>", () => {
  it("calls onSubmit()", () => {
    const props = {
      onGoBack: jest.fn(),
      onSubmit: jest.fn(),
      email: "stubbo_mc_stubbington@gmail.com",
      onEmailChange: jest.fn()
    };

    const el = shallow(<ForgotPassword {...props} />);
    el.find("form").simulate("submit", {});

    expect(props.onSubmit).toHaveBeenCalled();
  });
});
