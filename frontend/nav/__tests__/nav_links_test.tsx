let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

let mockDev = false;
jest.mock("../../account/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import * as React from "react";
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

  it("shows links", () => {
    mockDev = true;
    const wrapper = mount(<NavLinks close={jest.fn()} alertCount={1} />);
    expect(wrapper.text().toLowerCase()).not.toContain("tools");
  });

  it("shows active link", () => {
    mockPath = "/app/designer";
    const wrapper = shallow(<NavLinks close={jest.fn()} alertCount={1} />);
    expect(wrapper.find("Link").first().hasClass("active")).toBeTruthy();
  });
});
