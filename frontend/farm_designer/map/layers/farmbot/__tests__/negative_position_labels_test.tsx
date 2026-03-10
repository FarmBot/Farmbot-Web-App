import React from "react";
import { render } from "@testing-library/react";
import {
  NegativePositionLabel, NegativePositionLabelProps,
} from "../negative_position_labels";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<NegativePositionLabel />", () => {
  const fakeProps = (): NegativePositionLabelProps => {
    return {
      position: { x: 1234, y: undefined, z: undefined },
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 }
    };
  };

  it("shows", () => {
    const p = fakeProps();
    p.position.y = -100;
    const { container } = render(<svg><NegativePositionLabel {...p} /></svg>);
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing label text"); }
    expect(text.textContent).toContain("(1234, -100, ---)");
    expect(text.getAttribute("visibility")).toEqual("visible");
  });

  it("doesn't show", () => {
    const p = fakeProps();
    p.position.y = 0;
    const { container } = render(<svg><NegativePositionLabel {...p} /></svg>);
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing label text"); }
    expect(text.textContent).toContain("(1234, 0, ---)");
    expect(text.getAttribute("visibility")).toEqual("hidden");
  });
});
