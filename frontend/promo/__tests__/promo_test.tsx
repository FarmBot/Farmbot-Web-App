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
import { Actions } from "../../constants";
import { getAnimatedSeasonSunCoordinate } from
  "../../three_d_garden/garden/sun";
import { CROP_SLUGS } from "../../crops/metadata";
import { STARGAZING_PROGRESS_STORAGE_KEY } from
  "../../farm_designer/stargazing_progress_key";

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

  it("opens and closes stargazing", async () => {
    window.location.search = "?animateSeasons=true";
    localStorage.setItem(
      STARGAZING_PROGRESS_STORAGE_KEY,
      JSON.stringify(CROP_SLUGS.slice(0, 50)),
    );
    const { container, unmount } = render(<Promo />);
    const gardenProps = () =>
      gardenModelSpy.mock.calls[gardenModelSpy.mock.calls.length - 1][0];

    expect(gardenProps().celestialView).toEqual(expect.objectContaining({
      mode: "normal",
      fov: 20,
    }));
    expect(gardenProps().config.animateSeasons).toEqual(true);
    const initialSunAzimuth = gardenProps().config.sunAzimuth;
    const initialSunInclination = gardenProps().config.sunInclination;
    act(() => gardenProps().celestialView.dispatch({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "stargazing",
    }));
    expect(gardenProps().celestialView.mode).toEqual("stargazing");
    const midnight = getAnimatedSeasonSunCoordinate(
      String(gardenProps().config.plants),
      0,
    );
    expect(gardenProps().config).toEqual(expect.objectContaining({
      animateSeasons: false,
      sunAzimuth: midnight.azimuth,
      sunInclination: midnight.inclination,
    }));
    expect(container.querySelector(".stargazing-controls"))
      .toHaveClass("active");
    expect(container.querySelector(".settings-bar"))
      .toHaveClass("focus-transition-hidden");
    expect(container.querySelector(".promo-info"))
      .toHaveClass("focus-transition-hidden");

    fireEvent.click(screen.getByRole("button", { name: "Spaceflight" }));
    expect(gardenProps().celestialView.mode).toEqual("spaceflight");
    fireEvent.click(screen.getByRole("button", {
      name: "Return to stargazing",
    }));
    expect(gardenProps().celestialView.mode).toEqual("stargazing");

    act(() => gardenProps().celestialView.dispatch({
      type: Actions.SET_3D_STARGAZING_FOV,
      payload: 55,
    }));
    expect(gardenProps().celestialView.fov).toEqual(55);

    fireEvent.click(screen.getByRole("button", { name: "Exit stargazing" }));
    expect(gardenProps().celestialView.mode).toEqual("normal");
    expect(gardenProps().config).toEqual(expect.objectContaining({
      animateSeasons: true,
      sunAzimuth: initialSunAzimuth,
      sunInclination: initialSunInclination,
    }));
    await waitFor(() => {
      expect(container.querySelector(".settings-bar"))
        .toHaveClass("focus-transition-visible");
      expect(container.querySelector(".promo-info"))
        .toHaveClass("focus-transition-visible");
    });
    unmount();
  });

  it("updates the promo sun from telescope time travel", () => {
    const { unmount } = render(<Promo />);
    const gardenProps = () =>
      gardenModelSpy.mock.calls[gardenModelSpy.mock.calls.length - 1][0];

    act(() => gardenProps().timeTravelDispatch({
      type: Actions.SET_3D_TIME,
      payload: "12:00",
    }));
    expect(gardenProps()).toEqual(expect.objectContaining({
      threeDTime: "12:00",
      config: expect.objectContaining({ animateSeasons: false }),
    }));

    act(() => gardenProps().timeTravelDispatch({
      type: Actions.SET_3D_TIME,
      payload: undefined,
    }));
    expect(gardenProps().threeDTime).toBeUndefined();
    unmount();
  });

  it("keeps focus and stargazing modes mutually exclusive", () => {
    focusFromUrlParamsSpy.mockReturnValue("What you can grow");
    const { unmount } = render(<Promo />);
    const gardenProps = () =>
      gardenModelSpy.mock.calls[gardenModelSpy.mock.calls.length - 1][0];

    expect(gardenProps()).toEqual(expect.objectContaining({
      activeFocus: "What you can grow",
      celestialView: expect.objectContaining({ mode: "normal" }),
    }));

    act(() => gardenProps().celestialView.dispatch({
      type: Actions.SET_3D_VIEW_MODE,
      payload: "stargazing",
    }));
    expect(gardenProps()).toEqual(expect.objectContaining({
      activeFocus: "",
      celestialView: expect.objectContaining({ mode: "stargazing" }),
    }));
    expect(pushStateSpy.mock.calls[0][2]).not.toContain("focus=");

    act(() => gardenProps().setActiveFocus("Included tools"));
    expect(gardenProps()).toEqual(expect.objectContaining({
      activeFocus: "Included tools",
      celestialView: expect.objectContaining({ mode: "normal" }),
    }));
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
