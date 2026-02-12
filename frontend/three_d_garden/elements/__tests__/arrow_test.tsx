import React from "react";
import { render } from "@testing-library/react";
import { Arrow, ArrowProps } from "../arrow";

describe("<Arrow />", () => {
  const fakeProps = (): ArrowProps => ({
    length: 10,
    width: 5,
  });

  it("renders", () => {
    const { container } = render(<Arrow {...fakeProps()} />);
    expect(container.innerHTML).toContain("extrude");
  });
});
