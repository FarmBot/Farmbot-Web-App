jest.mock("../data", () => ({
  WizardData: {
    setOrderNumber: jest.fn(),
    getOrderNumber: jest.fn(),
  },
}));

let mockOnlineValue = true;
jest.mock("../../devices/must_be_online", () => ({
  isBotOnlineFromState: () => mockOnlineValue,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { botOnlineReq, ProductRegistration } from "../prerequisites";
import { WizardData } from "../data";

describe("<ProductRegistration />", () => {
  it("updates value", () => {
    const wrapper = shallow(<ProductRegistration />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "123" }
    });
    expect(WizardData.setOrderNumber).toHaveBeenCalledWith("123");
  });
});

describe("botOnlineReq()", () => {
  it("returns offline message", () => {
    mockOnlineValue = false;
    const wrapper = mount(<botOnlineReq.indicator />);
    expect(wrapper.text().toLowerCase()).toContain("unable");
  });

  it("returns online message", () => {
    mockOnlineValue = true;
    const wrapper = mount(<botOnlineReq.indicator />);
    expect(wrapper.text().toLowerCase()).not.toContain("unable");
  });
});
