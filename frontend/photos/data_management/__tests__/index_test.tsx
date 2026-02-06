let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => {
  const actual = jest.requireActual("../../../settings/dev/dev_support");
  return {
    ...actual,
    DevSettings: {
      ...actual.DevSettings,
      showInternalEnvsEnabled: () => mockDev,
      overriddenFbosVersion: jest.fn(),
    },
  };
});

import React from "react";
import { mount } from "enzyme";
import { ImagingDataManagement } from "../index";
import { ImagingDataManagementProps } from "../interfaces";

afterAll(() => {
  jest.unmock("../../../settings/dev/dev_support");
});

describe("<ImagingDataManagement />", () => {
  const fakeProps = (): ImagingDataManagementProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    farmwareEnvs: [],
  });

  it("renders toggle", () => {
    const wrapper = mount(<ImagingDataManagement {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("highlight");
  });

  it("doesn't render advanced", () => {
    mockDev = false;
    const wrapper = mount(<ImagingDataManagement {...fakeProps()} />);
    expect(wrapper.text()).not.toContain("Advanced");
  });

  it("toggles advanced", () => {
    mockDev = true;
    const wrapper = mount(<ImagingDataManagement {...fakeProps()} />);
    expect(wrapper.find(".farmware-env-editor").length).toEqual(0);
    wrapper.find(".expandable-header").simulate("click");
    expect(wrapper.find(".farmware-env-editor").length).toEqual(1);
  });
});
