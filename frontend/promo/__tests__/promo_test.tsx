import React from "react";
import {
  act, render, screen, fireEvent, waitFor,
} from "@testing-library/react";
import { getPromoPlantCapacities, getSeasonTimings, Promo } from "../promo";
import * as reactThreeFiber from "@react-three/fiber";
import * as gardenModelModule from "../../three_d_garden/garden_model";
import * as zoomBeaconConstants from
  "../../three_d_garden/zoom_beacons_constants";
import { INITIAL, PRESETS } from "../../three_d_garden/config";
import { calculatePlantPositions } from "../plants";
import * as screenSize from "../../screen_size";
import { PROMO_RESOURCES_KEY } from "../resources";

type CanvasComponentProps = React.ComponentProps<typeof reactThreeFiber.Canvas>;
type CanvasCreatedState =
  Parameters<NonNullable<CanvasComponentProps["onCreated"]>>[0];

describe("<Promo />", () => {
  const originalSearch = window.location.search;
  const originalConsoleError = console.error;
  let canvasSpy: jest.SpyInstance;
  let gardenModelSpy: jest.SpyInstance;
  let pushStateSpy: jest.SpyInstance;
  let focusFromUrlParamsSpy: jest.SpyInstance;
  let isMobileSpy: jest.SpyInstance;

  beforeEach(() => {
    canvasSpy = jest.spyOn(reactThreeFiber, "Canvas")
      .mockImplementation(({
        children,
        onCreated,
      }: CanvasComponentProps) => {
        const state = {
          gl: { localClippingEnabled: false },
        } as CanvasCreatedState;
        onCreated?.(state);
        return <div>{children}</div>;
      });
    gardenModelSpy = jest.spyOn(gardenModelModule, "GardenModel")
      .mockImplementation(({ config }: { config: { promoSpread?: boolean } }) =>
        <div>{config.promoSpread ? "spread" : "garden-model"}</div>);
    pushStateSpy = jest.spyOn(history, "pushState")
      .mockImplementation(jest.fn());
    focusFromUrlParamsSpy = jest
      .spyOn(zoomBeaconConstants, "getFocusFromUrlParams")
      .mockReturnValue("");
    isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
  });

  afterEach(() => {
    window.location.search = originalSearch;
    localStorage.removeItem(PROMO_RESOURCES_KEY);
    jest.useRealTimers();
    console.error = originalConsoleError;
    canvasSpy.mockRestore();
    gardenModelSpy.mockRestore();
    pushStateSpy.mockRestore();
    focusFromUrlParamsSpy.mockRestore();
    isMobileSpy.mockRestore();
  });

  it("renders", () => {
    console.error = jest.fn();
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
    expect(container.querySelector(".view-prism-viewport")).toBeFalsy();
    expect(gardenModelSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        plantIconCapacities: expect.any(Object),
        plantInstanceCapacity: expect.any(Number),
        smoothFocusTransitions: true,
      }),
    );
    unmount();
  });

  it("shows guidance when WebGL is unavailable", () => {
    const webGLSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockImplementation((() => null) as never);
    const { container, unmount } = render(<Promo />);
    expect(container.textContent).toContain("3D graphics unavailable");
    expect(container.textContent).toContain("Enable WebGL");
    expect(container.querySelector(".three-d-required-toggle")).toBeFalsy();
    expect(container.querySelector(".overlay")).toBeTruthy();
    expect(container.querySelector(".settings-bar-loaded")).toBeTruthy();
    expect(container.querySelector(".gear")).toBeTruthy();
    expect(canvasSpy).not.toHaveBeenCalled();
    webGLSpy.mockRestore();
    unmount();
  });

  it("shows the view prism when viewCube is enabled", () => {
    window.location.search = "?viewCube=true";
    const { container, unmount } = render(<Promo />);
    expect(container.querySelector(".view-prism-viewport")).toBeTruthy();
    expect(canvasSpy).toHaveBeenCalledTimes(2);
    unmount();
  });

  it("loads settings bar after the 3D scene is ready", () => {
    const { container, unmount } = render(<Promo />);
    expect(container.querySelector(".settings-bar-loaded")).toBeFalsy();
    act(() => {
      gardenModelSpy.mock.calls[0][0].onDetailsRevealStart();
    });
    expect(container.querySelector(".settings-bar-loaded")).toBeTruthy();
    unmount();
  });

  it("doesn't expose stargazing in the promo", () => {
    const { container, unmount } = render(<Promo />);
    const gardenProps =
      gardenModelSpy.mock.calls[gardenModelSpy.mock.calls.length - 1][0];
    expect(gardenProps.celestialView).toBeUndefined();
    expect(gardenProps.timeTravelDispatch).toBeUndefined();
    expect(container.querySelector(".stargazing-controls")).toBeNull();
    unmount();
  });

  it("renders: animated seasons", () => {
    jest.useFakeTimers();
    console.error = jest.fn();
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
    const configBtn = container.querySelector(".gear") as HTMLElement;
    fireEvent.click(configBtn);
    const configs = screen.getAllByTitle("animateSeasons");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const config = configs[configs.length - 1] as HTMLElement;
    fireEvent.click(config);
    jest.runAllTimers();
    unmount();
  });

  it("opens config menu", () => {
    const { container, unmount } = render(<Promo />);
    expect(container).not.toContainHTML("all-configs");
    const configBtn = container.querySelector(".gear") as HTMLElement;
    fireEvent.click(configBtn);
    expect(container).toContainHTML("all-configs");
    fireEvent.click(screen.getByRole("button", { name: "Summer" }));
    const lastCall =
      gardenModelSpy.mock.calls[gardenModelSpy.mock.calls.length - 1];
    expect(lastCall[0].seasonResetKey).toEqual(1);
    unmount();
  });

  it("renders spread", () => {
    window.location.search = "?promoSpread=true&bedLengthOuter=1234";
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("spread");
    unmount();
  });

  it("applies constellation promo configs", () => {
    window.location.search =
      "?constellations=true&constellationsDebug=true";
    const { unmount } = render(<Promo />);
    expect(gardenModelSpy.mock.calls[0][0].config).toEqual(
      expect.objectContaining({
        constellations: true,
        constellationsDebug: true,
      }),
    );
    unmount();
  });

  it("uses promo resources from local storage", () => {
    localStorage.setItem(PROMO_RESOURCES_KEY, JSON.stringify({
      plants: [{ name: "Spinach", openfarm_slug: "spinach", x: 100, y: 200 }],
      points: [{ name: "Point 1", x: 300, y: 400, z: -100 }],
      weeds: [{ name: "Weed", x: 500, y: 600, z: -100 }],
    }));
    const { unmount } = render(<Promo />);
    expect(gardenModelSpy.mock.calls[0][0].threeDPlants)
      .toEqual([expect.objectContaining({ label: "Spinach", x: 100, y: 200 })]);
    expect(gardenModelSpy.mock.calls[0][0].mapPoints)
      .toEqual([expect.objectContaining({
        body: expect.objectContaining({ name: "Point 1", x: 300, y: 400 }),
      })]);
    expect(gardenModelSpy.mock.calls[0][0].weeds)
      .toEqual([expect.objectContaining({
        body: expect.objectContaining({ name: "Weed", x: 500, y: 600 }),
      })]);
    unmount();
  });

  it("adjusts the initial mobile heading", () => {
    isMobileSpy.mockReturnValue(true);
    const { unmount } = render(<Promo />);
    expect(gardenModelSpy.mock.calls[0][0].config)
      .toEqual(expect.objectContaining({ viewpointHeading: 80 }));
    unmount();
  });

  it("clears active focus on Escape", async () => {
    focusFromUrlParamsSpy.mockReturnValue("What you can grow");
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const { container, unmount } = render(<Promo />);
    await waitFor(() => expect(gardenModelSpy.mock.calls[0][0])
      .toEqual(expect.objectContaining({ activeFocus: "What you can grow" })));
    const promo = container.querySelector(".promo") as HTMLElement;
    fireEvent.keyDown(promo, { key: "Enter" });
    const keyDownListener = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName == "keydown",
    )?.[1] as EventListener;
    act(() => keyDownListener(new KeyboardEvent("keydown", { key: "Enter" })));
    expect(pushStateSpy).not.toHaveBeenCalled();
    act(() => keyDownListener(new KeyboardEvent("keydown", { key: "Escape" })));
    await waitFor(() => expect(pushStateSpy).toHaveBeenCalled());
    const nextUrl = pushStateSpy.mock.calls[0][2] as string;
    expect(nextUrl).not.toContain("focus=");
    unmount();
    addEventListenerSpy.mockRestore();
  });
});

describe("getSeasonTimings()", () => {
  it("returns timings", () => {
    expect(getSeasonTimings("Summer").season).toEqual("Summer");
    expect(getSeasonTimings("Random").season).toEqual("Spring");
  });
});

describe("getPromoPlantCapacities()", () => {
  it("keeps capacity at least as large as the current layout", () => {
    const config = {
      ...INITIAL,
      ...PRESETS["Genesis"],
      plants: "Spring",
    };
    const capacities = getPromoPlantCapacities(config);
    const plants = calculatePlantPositions(config);
    expect(capacities.plantInstanceCapacity).toBeGreaterThanOrEqual(
      plants.length,
    );
    plants.map(plant =>
      expect(capacities.iconCapacities[plant.icon]).toBeGreaterThan(0));
  });

  it("precalculates capacities for other seasons", () => {
    const config = {
      ...INITIAL,
      ...PRESETS["Genesis"],
      plants: "Spring",
    };
    const capacities = getPromoPlantCapacities(config);
    const summerPlants = calculatePlantPositions({
      ...config,
      plants: "Summer",
    });
    summerPlants.map(plant =>
      expect(capacities.iconCapacities[plant.icon]).toBeGreaterThan(0));
  });
});
