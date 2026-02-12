import React from "react";
import { render } from "@testing-library/react";
import { AddPlantIcon, AddPlantIconProps } from "../add_plant_icon";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { Path } from "../../../../internal_urls";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<AddPlantIcon />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.plants());
  });

  const fakeProps = (): AddPlantIconProps => ({
    designer: fakeDesignerState(),
    cursorPosition: { x: 1, y: 2 },
    mapTransformProps: fakeMapTransformProps(),
  });

  it("returns icon", () => {
    const { container } = render(<svg><AddPlantIcon {...fakeProps()} /></svg>);
    const images = container.querySelectorAll("image");
    expect(images.length).toEqual(1);
    expect(images[0]?.getAttribute("xlink:href"))
      .toEqual("/crops/icons/generic-plant.avif");
  });

  it("doesn't return icon", () => {
    const p = fakeProps();
    p.cursorPosition = undefined;
    const { container } = render(<svg><AddPlantIcon {...p} /></svg>);
    expect(container.querySelectorAll("image").length).toEqual(0);
  });

  it("returns specific icon", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<svg><AddPlantIcon {...p} /></svg>);
    const images = container.querySelectorAll("image");
    expect(images.length).toEqual(1);
    expect(images[0]?.getAttribute("xlink:href"))
      .toEqual("/crops/icons/mint.avif");
  });
});
