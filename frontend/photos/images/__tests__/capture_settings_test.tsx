let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  CaptureSettingsProps, CaptureSettings, DISABLE_ROTATE_AT_CAPTURE_KEY,
} from "../capture_settings";

describe("<CaptureSettings />", () => {
  const fakeProps = (): CaptureSettingsProps => ({
    env: {},
    saveFarmwareEnv: jest.fn(),
    shouldDisplay: jest.fn(),
    botOnline: true,
    dispatch: jest.fn(),
    version: "1.0.14",
  });

  it("toggles setting on", () => {
    const p = fakeProps();
    const wrapper = mount(<CaptureSettings {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      DISABLE_ROTATE_AT_CAPTURE_KEY, "1");
  });

  it("toggles setting off", () => {
    const p = fakeProps();
    p.env = { [DISABLE_ROTATE_AT_CAPTURE_KEY]: "1" };
    const wrapper = mount(<CaptureSettings {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      DISABLE_ROTATE_AT_CAPTURE_KEY, "0");
  });

  it.each<["yes" | "no" | undefined, string | undefined, string]>([
    [undefined, undefined, ""],
    [undefined, undefined, "1.0.13"],
    ["yes", undefined, "1.0.14"],
    ["no", undefined, "1.0.15"],
    ["no", "1", "1.0.13"],
    ["no", "1", "1.0.14"],
    ["no", "1", "1.0.15"],
    ["yes", "0", "1.0.13"],
    ["yes", "0", "1.0.14"],
    ["yes", "0", "1.0.15"],
  ])("renders correct state: %s for env: %s and version: %s",
    (label, envValue, version) => {
      const p = fakeProps();
      p.version = version;
      p.env = { [DISABLE_ROTATE_AT_CAPTURE_KEY]: envValue };
      const wrapper = mount(<CaptureSettings {...p} />);
      label
        ? expect(wrapper.find("button").last().text()).toEqual(label)
        : expect(wrapper.find(".capture-rotate-setting").length).toEqual(0);
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
    expect(wrapper.find("input").last().props().value).toEqual(480);
  });

  it("changes capture size", () => {
    mockDev = true;
    const p = fakeProps();
    p.env = { take_photo_width: "200", take_photo_height: "100" };
    const wrapper = shallow(<CaptureSettings {...p} />);
    wrapper.find("BlurableInput").at(0).simulate("commit", {
      currentTarget: { value: "400" }
    });
    wrapper.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "300" }
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_width", "400");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("take_photo_height", "300");
  });
});
