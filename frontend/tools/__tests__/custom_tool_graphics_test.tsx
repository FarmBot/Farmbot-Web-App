let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({ store: { getState: () => mockState } }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  CustomToolGraphicsInput,
  CustomToolGraphicsInputProps,
  CustomToolProfile,
  CustomToolProfileProps,
  CustomToolTop,
  CustomToolTopProps,
  getCustomToolGraphicsKey,
} from "../custom_tool_graphics";
import { fakeFarmwareEnv } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { svgMount } from "../../__test_support__/svg_mount";

describe("<CustomToolGraphicsInput />", () => {
  const fakeProps = (): CustomToolGraphicsInputProps => ({
    toolName: "tool",
    dispatch: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("doesn't render inputs", () => {
    mockDev = false;
    const wrapper = mount(<CustomToolGraphicsInput {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("custom-tool-graphics-input");
  });

  it("renders inputs", () => {
    mockDev = true;
    const wrapper = mount(<CustomToolGraphicsInput {...fakeProps()} />);
    expect(wrapper.html()).toContain("custom-tool-graphics-input");
  });

  it("edits inputs", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = shallow(<CustomToolGraphicsInput {...p} />);
    wrapper.find("details").simulate("click");
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "abc" }
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "custom_tool_graphics_tool",
      "{\"top\":\"abc\"}",
    );
  });
});

describe("<CustomToolTop />", () => {
  beforeEach(() => {
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = getCustomToolGraphicsKey("tool");
    fakeEnv.body.value = JSON.stringify({ top: "h 10" });
    mockState.resources = buildResourceIndex([fakeEnv]);
  });

  const fakeProps = (): CustomToolTopProps => ({
    toolName: undefined,
    x: 0,
    y: 0,
  });

  it("doesn't render custom tool", () => {
    const p = fakeProps();
    p.toolName = undefined;
    const wrapper = svgMount(<CustomToolTop {...p} />);
    expect(wrapper.html()).not.toContain("custom-top");
  });

  it("renders custom tool", () => {
    const p = fakeProps();
    p.toolName = "tool";
    const wrapper = svgMount(<CustomToolTop {...p} />);
    expect(wrapper.html()).toContain("custom-top");
  });
});

describe("<CustomToolProfile />", () => {
  beforeEach(() => {
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = getCustomToolGraphicsKey("tool");
    fakeEnv.body.value = JSON.stringify({ front: "h 1234" });
    mockState.resources = buildResourceIndex([fakeEnv]);
  });

  const fakeProps = (): CustomToolProfileProps => ({
    toolName: undefined,
    xToolMiddle: 0,
    yToolBottom: 0,
    sideView: false,
  });

  it("doesn't render custom tool profile", () => {
    const p = fakeProps();
    p.toolName = undefined;
    const wrapper = svgMount(<CustomToolProfile {...p} />);
    expect(wrapper.html()).not.toContain("custom-implement-profile");
    expect(wrapper.html()).not.toContain("h 1234");
  });

  it("renders custom tool profile", () => {
    const p = fakeProps();
    p.toolName = "tool";
    const wrapper = svgMount(<CustomToolProfile {...p} />);
    expect(wrapper.html()).toContain("custom-implement-profile");
    expect(wrapper.html()).toContain("h 1234");
  });

  it("renders custom tool profile side view", () => {
    const fakeEnv = fakeFarmwareEnv();
    fakeEnv.body.key = getCustomToolGraphicsKey("tool");
    fakeEnv.body.value = JSON.stringify({
      front: "h 1234", side: "v 1234", mirror: "true",
    });
    mockState.resources = buildResourceIndex([fakeEnv]);
    const p = fakeProps();
    p.toolName = "tool";
    p.sideView = true;
    const wrapper = svgMount(<CustomToolProfile {...p} />);
    expect(wrapper.html()).toContain("custom-implement-profile");
    expect(wrapper.html()).not.toContain("h 1234");
    expect(wrapper.html()).toContain("v 1234");
    expect(wrapper.html()).toContain("scale(-1,1)");
  });
});
