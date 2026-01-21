import React from "react";
import { render } from "@testing-library/react";
import { DistanceIndicator } from "../distance_indicator";

describe("<DistanceIndicator />", () => {
  it("renders labels", () => {
    const { container } = render(<DistanceIndicator
      start={{ x: 0, y: 0, z: 0 }}
      end={{ x: 0, y: 0, z: 1000 }} />);
    const matches = container.innerHTML.match(/distance-label/g) || [];
    expect(matches.length).toEqual(4);
  });
});
