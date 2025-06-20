import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { getSeasonTimings, Promo } from "../promo";

describe("<Promo />", () => {
  it("renders", () => {
    console.error = jest.fn();
    const { container } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
  });

  it("renders: animated seasons", () => {
    console.error = jest.fn();
    const { container } = render(<Promo />);
    expect(container).toContainHTML("three-d-garden");
    const configBtn = screen.getByTitle("config");
    fireEvent.click(configBtn);
    const config = screen.getByTitle("animateSeasons");
    jest.useFakeTimers();
    fireEvent.click(config);
    jest.runAllTimers();
  });

  it("opens config menu", () => {
    const { container } = render(<Promo />);
    expect(container).not.toContainHTML("all-configs");
    const configBtn = screen.getByTitle("config");
    fireEvent.click(configBtn);
    expect(container).toContainHTML("all-configs");
  });
});

describe("getSeasonTimings()", () => {
  it("returns timings", () => {
    expect(getSeasonTimings("Summer").season).toEqual("Summer");
    expect(getSeasonTimings("Random").season).toEqual("Spring");
  });
});
