import * as React from "react";
import { DeleteAccount } from "../delete_account";
import { mount, shallow } from "enzyme";
import { DeleteAccountProps } from "../../interfaces";
import { BlurablePassword } from "../../../ui/blurable_password";

describe("<DeleteAccount/>", () => {
  const fakeProps = (): DeleteAccountProps => ({
    onClick: jest.fn(),
  });

  it("executes account deletion", () => {
    const p = fakeProps();
    const wrapper = mount(<DeleteAccount {...p} />);
    wrapper.setState({ password: "123" });
    wrapper.find("button.red").last().simulate("click");
    expect(p.onClick).toHaveBeenCalledTimes(1);
    expect(p.onClick).toHaveBeenCalledWith("123");
  });

  it("enters password", () => {
    const wrapper = shallow<DeleteAccount>(<DeleteAccount {...fakeProps()} />);
    wrapper.find(BlurablePassword).simulate("commit", {
      currentTarget: { value: "password" }
    });
    expect(wrapper.state().password).toEqual("password");
  });

  it("enters password", () => {
    const wrapper = mount<DeleteAccount>(<DeleteAccount {...fakeProps()} />);
    wrapper.setState({ password: "password" });
    wrapper.unmount();
    expect(wrapper).toEqual({});
  });
});
