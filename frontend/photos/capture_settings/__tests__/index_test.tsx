let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import { mount } from "enzyme";
import { CaptureSettings } from "../index";
import { CaptureSettingsProps } from "../interfaces";
import { FBSelect } from "../../../ui";

describe("<CaptureSettings />", () => {
  const fakeProps = (): CaptureSettingsProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    shouldDisplay: jest.fn(),
    botOnline: true,
    dispatch: jest.fn(),
    version: "1.0.14",
  });

  it("doesn't display size", () => {
    mockDev = false;
    const wrapper = mount(<CaptureSettings {...fakeProps()} />);
    expect(wrapper.text()).not.toContain("resolution");
  });

  it("displays default size", () => {
    mockDev = true;
    const wrapper = mount(<CaptureSettings {...fakeProps()} />);
    expect(wrapper.text()).toContain("resolution");
    expect(wrapper.find(FBSelect).last().props().selectedItem?.value)
      .toEqual("640x480");
  });
});
