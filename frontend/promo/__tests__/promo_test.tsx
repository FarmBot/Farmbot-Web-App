import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { getSeasonTimings, Promo } from "../promo";
import * as reactThreeFiber from "@react-three/fiber";
import * as gardenModelModule from "../../three_d_garden/garden_model";

describe("<Promo />", () => {
  const originalSearch = window.location.search;
  const originalConsoleError = console.error;
  let canvasSpy: jest.SpyInstance;
  let gardenModelSpy: jest.SpyInstance;

  beforeEach(() => {
    canvasSpy = jest.spyOn(reactThreeFiber, "Canvas")
      .mockImplementation(({ children }: { children?: React.ReactNode }) =>
        <div>{children}</div>);
    gardenModelSpy = jest.spyOn(gardenModelModule, "GardenModel")
      .mockImplementation(({ config }: { config: { promoSpread?: boolean } }) =>
        <div>{config.promoSpread ? "spread" : "garden-model"}</div>);
  });

  afterEach(() => {
    window.location.search = originalSearch;
    jest.useRealTimers();
    console.error = originalConsoleError;
    canvasSpy.mockRestore();
    gardenModelSpy.mockRestore();
  });

  it("renders", () => {
    console.error = jest.fn();
    const { container, unmount } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
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
});

describe("getSeasonTimings()", () => {
  it("returns timings", () => {
    expect(getSeasonTimings("Summer").season).toEqual("Summer");
    expect(getSeasonTimings("Random").season).toEqual("Spring");
  });
});
