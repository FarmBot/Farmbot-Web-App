import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  PublicOverlay, OverlayProps, PrivateOverlay, maybeAddParam,
} from "../config_overlays";
import { INITIAL, PRESETS } from "../config";
import { clone } from "lodash";
import * as zoomBeaconConstants from "../zoom_beacons_constants";
import * as camera from "../camera";
import { getSeasonAnimationElapsed } from "../garden/sun";

let setUrlParamSpy: jest.SpyInstance;
let clearCameraUrlParamsSpy: jest.SpyInstance | undefined;

beforeEach(() => {
  jest.clearAllMocks();
  setUrlParamSpy = jest.spyOn(zoomBeaconConstants, "setUrlParam")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  setUrlParamSpy.mockRestore();
  clearCameraUrlParamsSpy?.mockRestore();
  clearCameraUrlParamsSpy = undefined;
  jest.useRealTimers();
});

describe("<PublicOverlay />", () => {
  const fakeProps = (): OverlayProps => ({
    config: clone(INITIAL),
    setConfig: jest.fn(),
    toolTip: { timeoutId: 0, text: "" },
    setToolTip: jest.fn(),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<PublicOverlay {...fakeProps()} />);
    expect(container.innerHTML).toContain("settings-bar");
  });

  it("marks settings bar as loaded", () => {
    const p = fakeProps();
    p.loadComplete = true;
    const { container } = render(<PublicOverlay {...p} />);
    expect(container.querySelector(".settings-bar-loaded")).toBeTruthy();
    expect(container.querySelector(".settings-bar-content")).toBeTruthy();
  });

  it("skips disabled settings bar content", () => {
    const p = fakeProps();
    p.config.settingsBar = false;
    const { container } = render(<PublicOverlay {...p} />);
    expect(container.querySelector(".settings-bar")).toBeFalsy();
    expect(container.querySelector(".settings-bar-content")).toBeFalsy();
  });

  it("hides public content for an active presentation mode", () => {
    const p = fakeProps();
    p.publicContentVisible = false;
    const { container } = render(<PublicOverlay {...p} />);
    expect(container.querySelector(".settings-bar")).toBeFalsy();
    expect(container.querySelector(".promo-info")).toBeFalsy();
  });

  it("changes preset", () => {
    const p = fakeProps();
    const { container } = render(<PublicOverlay {...p} />);
    const button = container.querySelectorAll("button").item(1);
    button && fireEvent.click(button);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      ...PRESETS["Genesis XL"],
      zAxisLength: 800,
    });
  });

  it("changes preset with ref", () => {
    const now = jest.spyOn(performance, "now").mockReturnValue(20_000);
    const p = fakeProps();
    p.startTimeRef = { current: 0 };
    p.seasonAnimationElapsedRef = { current: undefined };
    const { getByRole, rerender } = render(<PublicOverlay {...p} />);
    const radio = getByRole("button", { name: "Winter" });
    fireEvent.click(radio);
    const elapsed = p.seasonAnimationElapsedRef.current || 0;
    expect(elapsed).toBeGreaterThan(0);
    expect(p.startTimeRef.current).toEqual(20);
    expect(getSeasonAnimationElapsed(false, p.startTimeRef)).toBeUndefined();

    p.config = { ...p.config, plants: "Winter", animateSeasons: false };
    rerender(<PublicOverlay {...p} />);
    fireEvent.click(getByRole("button", { name: "Play seasons" }));
    expect(p.seasonAnimationElapsedRef.current).toBeUndefined();
    expect(getSeasonAnimationElapsed(true, p.startTimeRef))
      .toBeCloseTo(elapsed);
    now.mockRestore();
  });

  it("doesn't allow mobile XL", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis XL";
    const { container } = render(<PublicOverlay {...p} />);
    jest.useFakeTimers();
    const button = container.querySelectorAll("button").item(7);
    button && fireEvent.click(button);
    expect(p.setConfig).not.toHaveBeenCalled();
    expect(p.setToolTip).toHaveBeenCalledWith(expect.objectContaining({
      timeoutId: expect.anything(),
      text: "Mobile beds are not recommended for Genesis XL machines",
    }));
    jest.runAllTimers();
    expect(p.setToolTip).toHaveBeenCalledWith({
      timeoutId: 0,
      text: "",
    });
  });

  it("sets buy button url and text", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.8";
    const { container } = render(<PublicOverlay {...p} />);
    const buyButton = container.querySelector(".buy-button");
    expect(buyButton?.getAttribute("href")).toContain("genesis-xl-v1-8");
    expect(buyButton?.textContent).toContain("GenesisXLv1.8");
  });

  it("toggles season animation controls", () => {
    const now = jest.spyOn(performance, "now").mockReturnValue(15_000);
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 10 };
    p.setSeasonAnimationPaused = jest.fn();
    const { getByLabelText, rerender } = render(<PublicOverlay {...p} />);

    fireEvent.click(getByLabelText("Pause seasons"));

    expect(p.startTimeRef.current).toEqual(-5);
    expect(p.setSeasonAnimationPaused).toHaveBeenCalledWith(true);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      animateSeasons: false,
    });

    p.config.animateSeasons = false;
    p.startTimeRef.current = -5;
    rerender(<PublicOverlay {...p} seasonAnimationPaused={true} />);
    now.mockReturnValue(20_000);
    fireEvent.keyDown(getByLabelText("Play seasons"), { key: "Enter" });

    expect(p.startTimeRef.current).toEqual(15);
    expect(p.setSeasonAnimationPaused).toHaveBeenCalledWith(false);
    now.mockRestore();
  });
});

describe("<PrivateOverlay />", () => {
  const fakeProps = (): OverlayProps => ({
    config: clone(INITIAL),
    setConfig: jest.fn(),
    toolTip: { timeoutId: 0, text: "" },
    setToolTip: jest.fn(),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<PrivateOverlay {...fakeProps()} />);
    expect(container.innerHTML).toContain("all-configs");
    expect(container.querySelector("details")).toBeFalsy();
  });

  it("focuses the config search", () => {
    const { getByPlaceholderText } = render(<PrivateOverlay {...fakeProps()} />);
    expect(document.activeElement).toEqual(getByPlaceholderText("Search configs"));
  });

  it("expands and collapses the configs", () => {
    const { container, queryByPlaceholderText } =
      render(<PrivateOverlay {...fakeProps()} />);
    const title = container.querySelector(".config-title");

    title && fireEvent.click(title);
    expect(queryByPlaceholderText("Search configs")).toBeNull();
    expect(container.querySelector(".config-expand-toggle i"))
      .toHaveClass("fa-caret-right");

    title && fireEvent.click(title);
    expect(queryByPlaceholderText("Search configs")).toBeTruthy();
    expect(container.querySelector(".config-expand-toggle i"))
      .toHaveClass("fa-caret-down");
  });

  it("filters configs", () => {
    const { container, getByPlaceholderText } =
      render(<PrivateOverlay {...fakeProps()} />);
    fireEvent.change(getByPlaceholderText("Search configs"), {
      target: { value: "promo" },
    });
    expect(container).toContainHTML("promoInfo");
    expect(container).toContainHTML("promoSpread");
    expect(container).not.toContainHTML("settingsBar");
  });

  it("clears the config search", () => {
    const { getByLabelText, getByPlaceholderText, queryByLabelText } =
      render(<PrivateOverlay {...fakeProps()} />);
    const input = getByPlaceholderText("Search configs");
    fireEvent.change(input, { target: { value: "promo" } });

    fireEvent.click(getByLabelText("Clear search"));

    expect(input).toHaveValue("");
    expect(document.activeElement).toEqual(input);
    expect(queryByLabelText("Clear search")).toBeNull();
  });

  it("includes constellation promo configs", () => {
    const { container, getByPlaceholderText } =
      render(<PrivateOverlay {...fakeProps()} />);
    fireEvent.change(getByPlaceholderText("Search configs"), {
      target: { value: "constellation" },
    });
    expect(container).toContainHTML("constellations");
    expect(container).toContainHTML("constellationsDebug");
  });

  it("changes value: number", () => {
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const input = container.querySelectorAll("input[type='number']").item(0);
    input && fireEvent.change(input, { target: { value: "123" } });
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      x: 123,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("doesn't change value: number", () => {
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const input = container.querySelectorAll("input[type='number']").item(0);
    input && fireEvent.change(input, { target: { value: "nope" } });
    expect(p.setConfig).not.toHaveBeenCalled();
  });

  it("changes value: toggle", () => {
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const input = container.querySelector("input[title='promoInfo']");
    input && fireEvent.click(input);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      promoInfo: false,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("resumes season animation from its current state", () => {
    const now = jest.spyOn(performance, "now").mockReturnValue(15_000);
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 10 };
    p.setSeasonAnimationPaused = jest.fn();
    const { container, rerender } = render(<PrivateOverlay {...p} />);
    const animationToggle = () => container.querySelector(
      "input[title='animateSeasons']",
    );
    const input = animationToggle();
    input && fireEvent.click(input);

    expect(p.startTimeRef.current).toEqual(-5);
    expect(p.setSeasonAnimationPaused).toHaveBeenCalledWith(true);

    p.config.animateSeasons = false;
    now.mockReturnValue(20_000);
    rerender(<PrivateOverlay {...p} />);
    const resumeInput = animationToggle();
    resumeInput && fireEvent.click(resumeInput);

    expect(p.startTimeRef.current).toEqual(15);
    expect(p.setSeasonAnimationPaused).toHaveBeenCalledWith(false);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      animateSeasons: true,
    });
    now.mockRestore();
  });

  it("clears camera URL values when URL camera tracking is disabled", () => {
    clearCameraUrlParamsSpy = jest.spyOn(camera, "clearCameraUrlParams")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.config.urlCameraPos = true;
    const { getByTitle } = render(<PrivateOverlay {...p} />);

    fireEvent.click(getByTitle("urlCameraPos"));

    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      urlCameraPos: false,
    });
    expect(clearCameraUrlParamsSpy).toHaveBeenCalled();
  });

  it("changes value: radio", () => {
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const input = container.querySelector("input[title='sizePreset Jr']");
    input && fireEvent.click(input);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      ...PRESETS["Jr"],
      x: 100,
      y: 100,
      z: -50,
      zAxisLength: 550,
    });
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("changes value: radio with ref", () => {
    const p = fakeProps();
    p.startTimeRef = { current: 0 };
    render(<PrivateOverlay {...p} />);
    const radio = screen.getByTitle("plants Winter");
    fireEvent.click(radio);
    expect(p.startTimeRef.current).not.toEqual(0);
    expect(p.setConfig).not.toHaveBeenCalledWith(p.config);
  });

  it("closes the config menu", () => {
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const close = container.querySelector(".close");
    close && fireEvent.click(close);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      config: false,
    });
  });

  it("closes the config menu with Escape", async () => {
    const p = fakeProps();
    render(<PrivateOverlay {...p} />);
    await waitFor(() =>
      expect(document.activeElement).toEqual(screen.getByPlaceholderText(
        "Search configs",
      )));
    expect(fireEvent.keyDown(screen.getByPlaceholderText("Search configs"), {
      key: "Escape",
      cancelable: true,
    })).toBeFalsy();
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      config: false,
    });
  });

  it("removes url param", () => {
    location.search = "?urlParamAutoAdd=true";
    const p = fakeProps();
    const { container } = render(<PrivateOverlay {...p} />);
    const remove = container.querySelector(".x");
    remove && fireEvent.click(remove);
    expect(setUrlParamSpy).toHaveBeenCalledWith("urlParamAutoAdd", "");
  });
});

describe("maybeAddParam()", () => {
  it("doesn't add param", () => {
    maybeAddParam(false, "x", "1");
    expect(setUrlParamSpy).not.toHaveBeenCalled();
  });

  it("adds param", () => {
    maybeAddParam(true, "x", "1");
    expect(setUrlParamSpy).toHaveBeenCalledWith("x", "1");
  });

  it("adds auto-add param and skips reset all", () => {
    maybeAddParam(false, "urlParamAutoAdd", "true");
    expect(setUrlParamSpy).toHaveBeenCalledWith("urlParamAutoAdd", "true");
    setUrlParamSpy.mockClear();
    maybeAddParam(true, "otherPreset", "Reset all");
    expect(setUrlParamSpy).not.toHaveBeenCalled();
  });
});
