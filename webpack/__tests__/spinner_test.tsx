import * as React from "react";
import { Spinner } from "../spinner";
import { render } from "enzyme";

describe("spinner", () => {
  it("renders a circle", () => {
    let spinner = render(<Spinner radius={5} strokeWidth={5} />);
    let circles = spinner.find("circle");
    expect(circles.length).toEqual(1);
  });
});
