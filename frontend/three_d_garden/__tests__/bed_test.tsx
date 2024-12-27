jest.mock("../../farm_designer/map/layers/plants/plant_actions", () => ({
  dropPlant: jest.fn(),
}));

import React from "react";
import { INITIAL } from "../config";
import { Bed, BedProps } from "../bed";
import { clone } from "lodash";
import { fireEvent, render, screen } from "@testing-library/react";
import { dropPlant } from "../../farm_designer/map/layers/plants/plant_actions";
import { Path } from "../../internal_urls";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";

describe("<Bed />", () => {
  const fakeProps = (): BedProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders bed", () => {
    const p = fakeProps();
    p.config.extraLegsX = 0;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("renders bed with extra legs", () => {
    const p = fakeProps();
    p.config.extraLegsX = 2;
    p.config.extraLegsY = 2;
    p.config.legsFlush = false;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("adds a plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(dropPlant).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1360, y: 620 },
    }));
  });
});
