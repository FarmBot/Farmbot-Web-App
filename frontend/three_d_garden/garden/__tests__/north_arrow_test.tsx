import React from "react";
import { render } from "@testing-library/react";
import { NorthArrow, NorthArrowProps } from "../north_arrow";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<NorthArrow />", () => {
  const fakeProps = (): NorthArrowProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<NorthArrow {...fakeProps()} />);
    expect(container).toContainHTML("north-arrow");
  });
});
