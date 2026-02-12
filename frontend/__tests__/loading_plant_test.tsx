import React from "react";
import { LoadingPlant } from "../loading_plant";
import { render, screen } from "@testing-library/react";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("<LoadingPlant/>", () => {
  it("renders loading text", () => {
    const { container } = render(<LoadingPlant animate={false} />);
    expect(container.querySelectorAll(".loading-plant").length).toEqual(0);
    expect(container.querySelector(".loading-plant-text"))
      .toHaveAttribute("y", "150");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate").length).toEqual(0);
  });

  it("renders loading animation", () => {
    const { container } = render(<LoadingPlant animate={true} />);
    expect(container.querySelector(".loading-plant")).toBeTruthy();
    const circle = container.querySelector(".loading-plant-circle");
    expect(circle).toHaveAttribute("r", "110");
    expect(circle).toHaveAttribute("cx", "150");
    expect(circle).toHaveAttribute("cy", "250");
    expect(container.querySelector(".loading-plant-text"))
      .toHaveAttribute("y", "435");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate").length).toEqual(1);
  });

  it("clears initial loading text", () => {
    const el = { outerHTML: "hidden" } as Pick<Element, "outerHTML">;
    const collection =
      [el as unknown as Element] as unknown as HTMLCollectionOf<Element>;
    jest.spyOn(document, "getElementsByClassName")
      .mockReturnValue(collection);
    const { container } = render(<LoadingPlant animate={false} />);
    expect(container.querySelectorAll(".loading-plant").length).toEqual(0);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(el.outerHTML).toEqual("");
  });
});
