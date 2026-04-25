import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { getPromoPlantCapacities, getSeasonTimings, Promo } from "../promo";
import * as reactThreeFiber from "@react-three/fiber";
import * as gardenModelModule from "../../three_d_garden/garden_model";
import { INITIAL, PRESETS } from "../../three_d_garden/config";
import { calculatePlantPositions } from "../plants";

describe("<Promo />", () => {
  const originalSearch = window.location.search;
  const originalConsoleError = console.error;
  let canvasSpy: jest.SpyInstance;
  let gardenModelSpy: jest.SpyInstance;
  let pushStateSpy: jest.SpyInstance;

  beforeEach(() => {
    canvasSpy = jest.spyOn(reactThreeFiber, "Canvas")
      .mockImplementation(({ children }: { children?: React.ReactNode }) =>
        <div>{children}</div>);
    gardenModelSpy = jest.spyOn(gardenModelModule, "GardenModel")
      .mockImplementation(({ config }: { config: { promoSpread?: boolean } }) =>
        <div>{config.promoSpread ? "spread" : "garden-model"}</div>);
    pushStateSpy = jest.spyOn(history, "pushState")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    history.replaceState(undefined, "", `/${originalSearch}`);
    jest.useRealTimers();
    console.error = originalConsoleError;
    canvasSpy.mockRestore();
    gardenModelSpy.mockRestore();
    pushStateSpy.mockRestore();
  });

  it("renders", () => {
    console.error = jest.fn();
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
    expect(gardenModelSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        plantIconCapacities: expect.any(Object),
        plantInstanceCapacity: expect.any(Number),
        smoothFocusTransitions: true,
      }),
    );
    unmount();
  });

  it("loads settings bar after the 3D scene is ready", () => {
    const { container, unmount } = render(<Promo />);
    expect(container.querySelector(".settings-bar-loaded")).toBeFalsy();
    act(() => {
      gardenModelSpy.mock.calls[0][0].onLoadComplete();
    });
    expect(container.querySelector(".settings-bar-loaded")).toBeTruthy();
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
    unmount();
  });

  it("renders spread", () => {
    window.location.search = "?promoSpread=true";
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("spread");
    unmount();
  });

  it("clears active focus on Escape", async () => {
    window.location.search = "?focus=What%20you%20can%20grow";
    const { unmount } = render(<Promo />);
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(pushStateSpy).toHaveBeenCalled());
    const nextUrl = pushStateSpy.mock.calls[0][2] as string;
    expect(nextUrl).not.toContain("focus=");
    unmount();
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
