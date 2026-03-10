import React from "react";
import { render } from "@testing-library/react";
import { TourList } from "../list";
import { TourListProps } from "../interfaces";

describe("<TourList />", () => {
  const fakeProps = (): TourListProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<TourList {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("start tour");
  });
});
