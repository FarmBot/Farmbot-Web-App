let mockDev = false;

import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
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
import { DevSettings } from "../../settings/dev/dev_support";
import { BlurableInput } from "../../ui";

let originalGetState: typeof store.getState;
let futureFeaturesEnabledSpy: jest.SpyInstance;

beforeEach(() => {
  futureFeaturesEnabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
    .mockImplementation(() => mockDev);
  originalGetState = store.getState;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
});

afterEach(() => {
  futureFeaturesEnabledSpy.mockRestore();
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
});

describe("<CustomToolGraphicsInput />", () => {
  const fakeProps = (): CustomToolGraphicsInputProps => ({
    toolName: "tool",
    dispatch: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    env: {},
  });

  it("doesn't render inputs", () => {
    mockDev = false;
    const { container } = render(<CustomToolGraphicsInput {...fakeProps()} />);
    expect(container.innerHTML).not.toContain("custom-tool-graphics-input");
  });

  it("renders inputs", () => {
    mockDev = true;
    const { container } = render(<CustomToolGraphicsInput {...fakeProps()} />);
    expect(container.innerHTML).toContain("custom-tool-graphics-input");
  });

  it("edits inputs", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = TestRenderer.create(<CustomToolGraphicsInput {...p} />);
    wrapper.root.findAllByType(BlurableInput)[0]?.props.onCommit({
      currentTarget: { value: "abc" }
    });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith(
      "custom_tool_graphics_tool",
      "{\"top\":\"abc\"}",
    );
    wrapper.unmount();
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
    const { container } = svgMount(<CustomToolTop {...p} />);
    expect(container.innerHTML).not.toContain("custom-top");
  });

  it("renders custom tool", () => {
    const p = fakeProps();
    p.toolName = "tool";
    const { container } = svgMount(<CustomToolTop {...p} />);
    expect(container.innerHTML).toContain("custom-top");
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
    const { container } = svgMount(<CustomToolProfile {...p} />);
    expect(container.innerHTML).not.toContain("custom-implement-profile");
    expect(container.innerHTML).not.toContain("h 1234");
  });

  it("renders custom tool profile", () => {
    const p = fakeProps();
    p.toolName = "tool";
    const { container } = svgMount(<CustomToolProfile {...p} />);
    expect(container.innerHTML).toContain("custom-implement-profile");
    expect(container.innerHTML).toContain("h 1234");
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
    const { container } = svgMount(<CustomToolProfile {...p} />);
    expect(container.innerHTML).toContain("custom-implement-profile");
    expect(container.innerHTML).not.toContain("h 1234");
    expect(container.innerHTML).toContain("v 1234");
    expect(container.innerHTML).toContain("scale(-1,1)");
  });
});
