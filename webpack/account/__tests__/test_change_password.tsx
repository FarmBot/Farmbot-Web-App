import * as React from "react";
import { mount } from "enzyme";
import { ChangePassword } from "../components";
import { ChangePwPropTypes } from "../interfaces";
import { taggedUser } from "../../__test_support__/user";

describe("<ChangePassword/>", function () {
  it("saves new user password", function () {
    let props: ChangePwPropTypes = {
      password: "wow",
      new_password: "wow",
      new_password_confirmation: "wow",
      onChange: jest.fn(),
      onClick: jest.fn(),
      user: taggedUser
    };
    let dom = mount(<ChangePassword {...props} />);
    expect(props.onClick).not.toHaveBeenCalled();
    dom.find("button").simulate("click");
    expect(props.onClick).toHaveBeenCalled();
    expect(dom.html()).toContain("password");
  });
});
