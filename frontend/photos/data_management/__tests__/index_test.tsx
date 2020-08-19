let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
    overriddenFbosVersion: jest.fn(),
  }
}));

import React from "react";
import { mount } from "enzyme";
import { ImagingDataManagement } from "../index";
import { ImagingDataManagementProps } from "../interfaces";

describe("<ImagingDataManagement />", () => {
  const fakeProps = (): ImagingDataManagementProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("renders toggle", () => {
    mockDev = true;
    const wrapper = mount(<ImagingDataManagement {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("highlight");
  });

  it("doesn't render toggle", () => {
    mockDev = false;
    const wrapper = mount(<ImagingDataManagement {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("highlight");
  });
});
