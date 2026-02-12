import React from "react";
import {
  getSelectionBoxArea, SelectionBox, SelectionBoxProps,
} from "../selection_box";
import { render } from "@testing-library/react";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

describe("<SelectionBox/>", () => {
  function fakeProps(): SelectionBoxProps {
    return {
      selectionBox: {
        x0: 40,
        y0: 30,
        x1: 240,
        y1: 130
      },
      mapTransformProps: fakeMapTransformProps(),
    };
  }

  const renderSelectionBox = (props: SelectionBoxProps) =>
    render(<svg><SelectionBox {...props} /></svg>);

  const getRequiredAttribute = (
    element: Element,
    attribute: string,
  ): number => {
    const value = element.getAttribute(attribute);
    if (value === null) { throw new Error(`Missing attribute: ${attribute}`); }
    return Number(value);
  };

  it("renders selection box", () => {
    const { container } = renderSelectionBox(fakeProps());
    const box = container.querySelector("rect");
    if (!box) { throw new Error("Missing selection box rect"); }
    expect(getRequiredAttribute(box, "x")).toEqual(40);
    expect(getRequiredAttribute(box, "y")).toEqual(30);
    expect(getRequiredAttribute(box, "width")).toEqual(200);
    expect(getRequiredAttribute(box, "height")).toEqual(100);
  });

  it("doesn't render selection box: partially undefined", () => {
    const p = fakeProps();
    p.selectionBox = { x0: 1, y0: 2, x1: undefined, y1: 4 };
    const { container } = renderSelectionBox(p);
    expect(container.querySelector("#selection-box")).toBeTruthy();
    expect(container.querySelector("#selection-box rect")).toBeNull();
  });

  it("renders selection box: quadrant 4", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    const { container } = renderSelectionBox(p);
    const box = container.querySelector("rect");
    if (!box) { throw new Error("Missing selection box rect"); }
    expect(getRequiredAttribute(box, "x")).toEqual(2760);
    expect(getRequiredAttribute(box, "y")).toEqual(1370);
    expect(getRequiredAttribute(box, "width")).toEqual(200);
    expect(getRequiredAttribute(box, "height")).toEqual(100);
  });
});

describe("getSelectionBoxArea()", () => {
  it("returns correct area", () => {
    expect(getSelectionBoxArea(undefined)).toEqual(0);
    expect(getSelectionBoxArea({ x0: 1, y0: 1, x1: undefined, y1: undefined }))
      .toEqual(0);
    expect(getSelectionBoxArea({ x0: 0, y0: 0, x1: 10, y1: 10 })).toEqual(100);
  });
});
