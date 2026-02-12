import React from "react";
import { fireEvent, render } from "@testing-library/react";
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
    const { container } = render(<ProfileViewer {...fakeProps()} />);
    const viewer = container.querySelector(".profile-viewer");
    const handle = container.querySelector(".profile-button");
    expect(viewer?.classList.contains("open")).toBeFalsy();
    expect(handle?.getAttribute("title")).toContain("open");
  });

  it("renders when closed and follow bot is selected", () => {
    const p = fakeProps();
    p.botLocationData.position = { x: 1, y: 2, z: 3 };
    p.designer.profileFollowBot = true;
    const { container } = render(<ProfileViewer {...p} />);
    const viewer = container.querySelector(".profile-viewer");
    expect(viewer?.classList.contains("open")).toBeFalsy();
    expect(viewer?.classList.contains("none-chosen")).toBeTruthy();
  });

  it("renders when open: y-axis", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    const { container } = render(<ProfileViewer {...p} />);
    const viewer = container.querySelector(".profile-viewer");
    const handle = container.querySelector(".profile-button");
    expect(viewer?.classList.contains("open")).toBeTruthy();
    expect(handle?.getAttribute("title")).toContain("close");
    expect(container.textContent).toContain("choose a profile");
    expect(container.innerHTML).not.toContain("svg");
    expect(container.textContent).toContain("axis");
    expect(container.querySelector("button")?.textContent).toEqual("y");
  });

  it("renders when open: x-axis", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "y";
    const { container } = render(<ProfileViewer {...p} />);
    expect(container.querySelector("button")?.textContent).toEqual("x");
  });

  it("renders profile", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileFollowBot = true;
    p.botLocationData.position = { x: undefined, y: undefined, z: undefined };
    const { container } = render(<ProfileViewer {...p} />);
    const viewer = container.querySelector(".profile-viewer");
    expect(viewer?.classList.contains("open")).toBeTruthy();
    expect(container.textContent).not.toContain("choose a profile");
    expect(container.textContent).toContain("FarmBot position unknown");
    expect(container.innerHTML).not.toContain("svg");
  });

  it("renders when open: follow", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileAxis = "x";
    const { container } = render(<ProfileViewer {...p} />);
    const viewer = container.querySelector(".profile-viewer");
    const handle = container.querySelector(".profile-button");
    expect(viewer?.classList.contains("open")).toBeTruthy();
    expect(handle?.getAttribute("title")).toContain("close");
    expect(container.textContent).toContain("choose a profile");
    expect(container.innerHTML).not.toContain("svg");
    expect(container.textContent).toContain("axis");
    expect(container.querySelector("button")?.textContent).toEqual("y");
  });

  it("renders profile: follow", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profileFollowBot = true;
    p.botLocationData.position = { x: 1, y: 2, z: 3 };
    const { container } = render(<ProfileViewer {...p} />);
    const viewer = container.querySelector(".profile-viewer");
    expect(viewer?.classList.contains("open")).toBeTruthy();
    expect(container.textContent).not.toContain("choose a profile");
    expect(container.innerHTML).toContain("svg");
    expect(container.textContent).toContain("axis");
  });

  it("opens profile viewer", () => {
    const p = fakeProps();
    const { container } = render(<ProfileViewer {...p} />);
    fireEvent.click(container.querySelector(".profile-button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_OPEN, payload: true,
    });
  });

  it("closes profile viewer", () => {
    const p = fakeProps();
    p.designer.profileOpen = true;
    p.designer.profilePosition = { x: 1, y: 2 };
    const { container } = render(<ProfileViewer {...p} />);
    const icons = container.querySelectorAll("i");
    fireEvent.click(icons[icons.length - 1] as Element);
    expect(container.querySelector("svg")?.classList.contains("expand"))
      .toBeFalsy();
    fireEvent.click(container.querySelector(".profile-button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PROFILE_OPEN, payload: false,
    });
    expect(container.querySelector("svg")?.classList.contains("expand"))
      .toBeFalsy();
  });
});
