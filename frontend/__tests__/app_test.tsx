let mockSatisfies = true;
jest.mock("bowser", () => ({
  getParser: () => ({ satisfies: () => mockSatisfies }),
}));
jest.mock("../nav", () => ({
  NavBar: () => <div>fake NavBar</div>,
}));

import React from "react";
import { RawApp as App, AppProps, mapStateToProps } from "../app";
import { render, screen } from "@testing-library/react";
import * as hotkeysModule from "../hotkeys";
import {
  fakeWebAppConfig, fakeFarmwareEnv,
} from "../__test_support__/fake_state/resources";
import { fakeState } from "../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../__test_support__/resource_index_builder";
import { ResourceName } from "farmbot";
import { error, warning } from "../toast/toast";
import { auth } from "../__test_support__/fake_state/token";
import {
  fakeDesignerState,
  fakeHelpState,
} from "../__test_support__/fake_designer_state";
import { Path } from "../internal_urls";
import { fakeApp } from "../__test_support__/fake_state/app";

const FULLY_LOADED: ResourceName[] = [
  "Sequence", "Regimen", "FarmEvent", "Point", "Tool", "Device"];

const fakeProps = (): AppProps => ({
  dispatch: jest.fn(),
  loaded: [],
  axisInversion: { x: false, y: false, z: false },
  xySwap: false,
  animate: false,
  getConfigValue: jest.fn(),
  helpState: fakeHelpState(),
  apiFirmwareValue: undefined,
  appState: fakeApp(),
  designer: fakeDesignerState(),
});

let hotKeysSpy: jest.SpyInstance;

beforeEach(() => {
  hotKeysSpy = jest.spyOn(hotkeysModule, "HotKeys")
    .mockImplementation(() => <div />);
});

afterEach(() => {
  try {
    jest.runOnlyPendingTimers();
  } catch { /* noop */ }
  jest.useRealTimers();
  hotKeysSpy.mockRestore();
});

describe("<App />: Loading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    location.pathname = Path.mock(Path.app());
  });

  it("MUST_LOADs not loaded", () => {
    render(<App {...fakeProps()} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("MUST_LOADs partially loaded", () => {
    const p = fakeProps();
    p.loaded = ["Sequence"];
    render(<App {...p} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("MUST_LOADs loaded", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    render(<App {...p} />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("times out while loading", () => {
    jest.useFakeTimers();
    render(<App {...fakeProps()} />);
    jest.runAllTimers();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("App could not be fully loaded"),
      { title: "Warning" });
  });

  it("loads before timeout", () => {
    const p = fakeProps();
    p.loaded = FULLY_LOADED;
    jest.useFakeTimers();
    render(<App {...p} />);
    jest.runAllTimers();
    expect(error).not.toHaveBeenCalled();
  });

  it("checks browser compatibility: ok", () => {
    mockSatisfies = true;
    const { container } = render(<App {...fakeProps()} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("checks browser compatibility: no", () => {
    mockSatisfies = false;
    render(<App {...fakeProps()} />);
    expect(warning).toHaveBeenCalled();
  });

  it("navigates to landing page", () => {
    location.pathname = Path.mock(Path.app());
    const p = fakeProps();
    p.getConfigValue = () => "controls";
    render(<App {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.controls());
  });

  it("doesn't navigate to landing page", () => {
    location.pathname = Path.mock(Path.controls());
    const p = fakeProps();
    p.getConfigValue = () => "controls";
    render(<App {...p} />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("enables the dark theme", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const { container } = render(<App {...p} />);
    expect(container.querySelector(".app")?.classList.contains("dark"))
      .toBeTruthy();
  });

  it("enables the light theme", () => {
    const p = fakeProps();
    p.getConfigValue = () => false;
    const { container } = render(<App {...p} />);
    expect(container.querySelector(".app")?.classList.contains("light"))
      .toBeTruthy();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.auth = auth;
    state.auth.token.unencoded.aud = "unknown";
    const config = fakeWebAppConfig();
    config.body.x_axis_inverted = true;
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "fakeKey";
    state.resources = buildResourceIndex([config, farmwareEnv]);
    const result = mapStateToProps(state);
    expect(result.axisInversion.x).toEqual(true);
  });
});
