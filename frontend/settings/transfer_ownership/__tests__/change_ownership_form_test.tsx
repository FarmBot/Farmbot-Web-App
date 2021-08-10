const mockDevice = { send: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../transfer_ownership/transfer_ownership", () => ({
  transferOwnership: jest.fn(() => Promise.resolve()),
}));

import React from "react";
import { ChangeOwnershipForm } from "../change_ownership_form";
import { mount, shallow } from "enzyme";
import { transferOwnership } from "../transfer_ownership";
import { API } from "../../../api";

describe("<ChangeOwnershipForm/>", () => {
  beforeEach(() => API.setBaseUrl("https://my.farm.bot"));

  it("renders", () => {
    const wrapper = mount(<ChangeOwnershipForm />);
    wrapper.setState({ open: true });
    ["email", "password", "server"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("opens form", () => {
    const wrapper = shallow<ChangeOwnershipForm>(<ChangeOwnershipForm />);
    expect(wrapper.state().open).toEqual(false);
    wrapper.find("ExpandableHeader").simulate("click");
    expect(wrapper.state().open).toEqual(true);
  });

  it("submits", () => {
    const wrapper = mount(<ChangeOwnershipForm />);
    wrapper.setState({ open: true, email: "email", password: "password" });
    wrapper.find("button").simulate("click");
    expect(transferOwnership).toHaveBeenCalledWith({
      device: mockDevice,
      email: "email",
      password: "password",
    });
  });

  it("changes email", () => {
    const wrapper = shallow<ChangeOwnershipForm>(<ChangeOwnershipForm />);
    expect(wrapper.state().email).toEqual("");
    wrapper.find("BlurableInput").first().simulate("commit",
      { currentTarget: { value: "email" } });
    expect(wrapper.state().email).toEqual("email");
  });

  it("changes password", () => {
    const wrapper = shallow<ChangeOwnershipForm>(<ChangeOwnershipForm />);
    expect(wrapper.state().password).toEqual("");
    wrapper.find("BlurablePassword").simulate("commit",
      { currentTarget: { value: "password" } });
    expect(wrapper.state().password).toEqual("password");
  });

  it("changes server", () => {
    const wrapper = shallow<ChangeOwnershipForm>(<ChangeOwnershipForm />);
    const input = wrapper.find("BlurableInput").last();
    input.simulate("commit",
      { currentTarget: { value: "nope" } });
    expect(input.props().disabled).toEqual(true);
  });
});
