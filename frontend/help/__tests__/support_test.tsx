let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import { mount } from "enzyme";
import { SupportPanel } from "../support";

describe("<SupportPanel />", () => {
  it("renders", () => {
    const wrapper = mount(<SupportPanel />);
    expect(wrapper.text().toLowerCase()).toContain("support staff");
    expect(wrapper.text().toLowerCase()).not.toContain("priority");
  });

  it("renders priority support", () => {
    mockDev = true;
    const wrapper = mount(<SupportPanel />);
    expect(wrapper.text().toLowerCase()).toContain("priority");
  });
});
