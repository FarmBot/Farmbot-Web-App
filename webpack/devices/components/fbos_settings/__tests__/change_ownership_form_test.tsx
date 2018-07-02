const mockDevice = {
  send: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../../transfer_ownership/transfer_ownership", () => {
  return { transferOwnership: jest.fn(() => Promise.resolve()) };
});

import * as React from "react";
import { ChangeOwnershipForm } from "../change_ownership_form";
import { mount } from "enzyme";
import { transferOwnership } from "../../../transfer_ownership/transfer_ownership";
import { API } from "../../../../api";
describe("<ChangeOwnershipForm/>", () => {
  beforeEach(() => API.setBaseUrl("https://my.farm.bot"));

  it("renders", () => {
    const wrapper =mount<>(<ChangeOwnershipForm />);
    ["email", "password", "server"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("submits", () => {
    const wrapper =mount<>(<ChangeOwnershipForm />);
    wrapper.find("button").simulate("click");
    expect(transferOwnership).toHaveBeenCalledWith({
      device: mockDevice,
      email: "",
      password: ""
    });
  });
});
