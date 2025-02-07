import React from "react";
import { render } from "@testing-library/react";
import { PottedPlant } from "../potted_plant";

describe("<PottedPlant />", () => {
  it("renders", () => {
    const { container } = render(<PottedPlant />);
    expect(container).toContainHTML("pot-with-plant");
  });
});
