import React from "react";
import { MapBackground } from "../map_background";
import { render } from "@testing-library/react";
import { MapBackgroundProps } from "../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

describe("<MapBackground/>", () => {
  function fakeProps(): MapBackgroundProps {
    return {
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 },
      templateView: false,
    };
  }

  const renderBackground = (props: MapBackgroundProps) =>
    render(<svg><MapBackground {...props} /></svg>);

  const getRequiredAttribute = (
    container: HTMLElement,
    selector: string,
    attribute: string,
  ) => {
    const element = container.querySelector(selector);
    if (!element) { throw new Error(`Missing element: ${selector}`); }
    const value = element.getAttribute(attribute);
    if (value === undefined) {
      throw new Error(`Missing attribute ${attribute} on ${selector}`);
    }
    return Number(value);
  };

  it("renders map background", () => {
    const { container } = renderBackground(fakeProps());
    expect(getRequiredAttribute(container, "#bed-interior", "width"))
      .toEqual(3180);
    expect(getRequiredAttribute(container, "#bed-interior", "height"))
      .toEqual(1680);
    expect(getRequiredAttribute(container, "#bed-border", "width"))
      .toEqual(3200);
    expect(getRequiredAttribute(container, "#bed-border", "height"))
      .toEqual(1700);
  });

  it("renders map background: X&Y swapped", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    const { container } = renderBackground(p);
    expect(getRequiredAttribute(container, "#bed-interior", "width"))
      .toEqual(1680);
    expect(getRequiredAttribute(container, "#bed-interior", "height"))
      .toEqual(3180);
    expect(getRequiredAttribute(container, "#bed-border", "width"))
      .toEqual(1700);
    expect(getRequiredAttribute(container, "#bed-border", "height"))
      .toEqual(3200);
  });
});
