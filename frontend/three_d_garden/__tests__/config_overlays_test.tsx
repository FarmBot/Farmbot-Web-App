import React from "react";
import {
  act, render, screen, fireEvent, waitFor,
} from "@testing-library/react";
import {
  PublicOverlay, OverlayProps, PrivateOverlay, maybeAddParam,
} from "../config_overlays";
import { INITIAL, PRESETS } from "../config";
import { clone } from "lodash";
import * as zoomBeaconConstants from "../zoom_beacons_constants";

let setUrlParamSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  setUrlParamSpy = jest.spyOn(zoomBeaconConstants, "setUrlParam")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  setUrlParamSpy.mockRestore();
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

  it("changes preset", () => {
    const p = fakeProps();
    const { container } = render(<PublicOverlay {...p} />);
    const button = container.querySelectorAll("button").item(1);
    button && fireEvent.click(button);
    expect(p.setConfig).toHaveBeenCalledWith({
      ...p.config,
      ...PRESETS["Genesis XL"],
    });
  });

  it("changes preset with ref", () => {
    const p = fakeProps();
    p.startTimeRef = { current: 0 };
    const { getByRole } = render(<PublicOverlay {...p} />);
    const radio = getByRole("button", { name: "Winter" });
    fireEvent.click(radio);
    expect(p.startTimeRef.current).not.toEqual(0);
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
      z: 50,
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
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const { unmount } = render(<PrivateOverlay {...p} />);
    try {
      await waitFor(() => expect(addEventListenerSpy)
        .toHaveBeenCalledWith("keydown", expect.any(Function)));
      const onKeyDown = addEventListenerSpy.mock.calls
        .find(([eventName]) => eventName == "keydown")?.[1] as EventListener;
      act(() => onKeyDown(new KeyboardEvent("keydown", { key: "Escape" })));
      expect(p.setConfig).toHaveBeenCalledWith({
        ...p.config,
        config: false,
      });
    } finally {
      unmount();
      addEventListenerSpy.mockRestore();
    }
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
});
