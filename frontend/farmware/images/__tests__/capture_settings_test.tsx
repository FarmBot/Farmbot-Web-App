import React from "react";
import { mount } from "enzyme";
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

  it("doesn't show toggle", () => {
    const p = fakeProps();
    p.version = "";
    const wrapper = mount(<CaptureSettings {...p} />);
    expect(wrapper.find(".capture-rotate-setting").length).toEqual(0);
  });
});
