import React from "react";
import { mount } from "enzyme";
import { ProfileViewerProps } from "../interfaces";
import { ProfileViewer } from "../viewer";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../__test_support__/fake_bot_data";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";
import { Actions } from "../../../../constants";
import { fakeMountedToolInfo } from "../../../../__test_support__/fake_tool_info";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

describe("<ProfileViewer />", () => {
  const fakeProps = (): ProfileViewerProps => ({
    dispatch: jest.fn(),
    designer: fakeDesignerState(),
    allPoints: [],
    botSize: fakeBotSize(),
    botLocationData: fakeBotLocationData(),
    peripheralValues: [],
    negativeZ: true,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    mountedToolInfo: fakeMountedToolInfo(),
    tools: [],
    mapTransformProps: fakeMapTransformProps(),
    getConfigValue: () => true,
    farmwareEnvs: [],
  });

  it("renders when closed", () => {
    const wrapper = mount(<ProfileViewer {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeFalsy();
    expect(wrapper.find(".profile-button").props().title).toContain("open");
  });

  it("renders when closed and follow bot is selected", () => {
    const p = fakeProps();
    p.botLocationData.position = { x: 1, y: 2, z: 3 };
    p.designer.profileFollowBot = true;
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeFalsy();
    expect(wrapper.find("div").first().hasClass("none-chosen")).toBeTruthy();
  });

  it("renders when open: y-axis", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeTruthy();
    expect(wrapper.find(".profile-button").props().title).toContain("close");
    expect(wrapper.text()).toContain("choose a profile");
    expect(wrapper.html()).not.toContain("svg");
    expect(wrapper.text()).toContain("axis");
    expect(wrapper.find("button").first().text()).toEqual("y");
  });

  it("renders when open: x-axis", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "y";
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("button").first().text()).toEqual("x");
  });

  it("renders profile", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileFollowBot = true;
    p.botLocationData.position = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeTruthy();
    expect(wrapper.text()).not.toContain("choose a profile");
    expect(wrapper.text()).toContain("FarmBot position unknown");
    expect(wrapper.html()).not.toContain("svg");
  });

  it("renders when open: follow", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeTruthy();
    expect(wrapper.find(".profile-button").props().title).toContain("close");
    expect(wrapper.text()).toContain("choose a profile");
    expect(wrapper.html()).not.toContain("svg");
    expect(wrapper.text()).toContain("axis");
    expect(wrapper.find("button").first().text()).toEqual("y");
  });

  it("renders profile: follow", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileFollowBot = true;
    p.botLocationData.position = { x: 1, y: 2, z: 3 };
    const wrapper = mount(<ProfileViewer {...p} />);
    expect(wrapper.find("div").first().hasClass("open")).toBeTruthy();
    expect(wrapper.text()).not.toContain("choose a profile");
    expect(wrapper.html()).toContain("svg");
    expect(wrapper.text()).toContain("axis");
  });

  it("opens profile viewer", () => {
    const p = fakeProps();
    const wrapper = mount(<ProfileViewer {...p} />);
    wrapper.find("div").at(1).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_OPEN, payload: true,
    });
  });

  it("closes profile viewer", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profilePosition = { x: 1, y: 2 };
    const wrapper = mount(<ProfileViewer {...p} />);
    wrapper.find("i").last().simulate("click");
    expect(wrapper.find("svg").hasClass("expand")).toBeFalsy();
    wrapper.find("div").at(1).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_OPEN, payload: false,
    });
    expect(wrapper.find("svg").hasClass("expand")).toBeFalsy();
  });
});
