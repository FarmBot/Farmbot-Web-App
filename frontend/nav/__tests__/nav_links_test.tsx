let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockHasSensors = false;
jest.mock("../../settings/firmware/firmware_hardware_support", () => ({
  hasSensors: () => mockHasSensors,
  getFwHardwareValue: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import { NavLinks } from "../nav_links";

describe("<NavLinks />", () => {
  it("toggles the mobile nav menu", () => {
    const close = jest.fn();
    const wrapper = shallow(<NavLinks close={(x) => () => close(x)}
      alertCount={0} />);
    wrapper.find("Link").first().simulate("click");
    expect(close).toHaveBeenCalledWith("mobileMenuOpen");
    expect(wrapper.text()).not.toContain("0");
  });

  it("shows indicator", () => {
    const wrapper = mount(<NavLinks close={jest.fn()} alertCount={1} />);
    expect(wrapper.text()).toContain("1");
  });

  it("shows active link", () => {
    mockPath = "/app/designer/plants";
    const wrapper = shallow(<NavLinks close={jest.fn()} alertCount={1} />);
    expect(wrapper.find("Link").at(0).hasClass("active")).toBeTruthy();
    expect(wrapper.html().toLowerCase()).not.toContain("sensors");
  });

  it("shows sensors link", () => {
    mockHasSensors = true;
    const wrapper = shallow(<NavLinks close={jest.fn()} alertCount={1}
      addMap={true} />);
    expect(wrapper.html().toLowerCase()).toContain("sensors");
    expect(wrapper.html()).toContain("desktop-hide");
  });
});
