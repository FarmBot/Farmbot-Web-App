const mockDevice = {
  send: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { ChangeOwnershipForm } from "../change_ownership_form";
import { mount } from "enzyme";

describe("<ChangeOwnershipForm/>", () => {
  it("renders", () => {
    const wrapper = mount(<ChangeOwnershipForm />);
    ["email", "password", "server"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("submits", () => {
    const wrapper = mount(<ChangeOwnershipForm />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.send).toHaveBeenCalledWith({
      "kind": "rpc_request",
      "args": { "label": expect.any(String) },
      "body": [
        {
          "kind": "pair",
          "args": { "label": "email", "value": "" }
        },
        {
          "kind": "pair",
          "args": { "label": "secret", "value": 0 }
        },
        {
          "kind": "pair",
          "args": { "label": "server", "value": "https://my.farm.bot" }
        }
      ]
    });
  });
});
