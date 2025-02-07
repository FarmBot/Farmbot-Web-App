import React from "react";
import { render } from "@testing-library/react";
import { Text, TextProps } from "../text";

describe("<Text />", () => {
  const fakeProps = (): TextProps => ({
    children: "text",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    fontSize: 10,
    color: "black",
  });

  it("renders", () => {
    const { container } = render(<Text {...fakeProps()} />);
    expect(container).toContainHTML("text");
  });
});
