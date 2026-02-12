import React from "react";
import { render } from "@testing-library/react";
import { StepWarning, conflictsString } from "../step_warning";

describe("<StepWarning />", () => {
  it("renders", () => {
    const { container } = render(<StepWarning warning={"warning"} />);
    const warning = container.querySelector(".step-warning");
    expect(container.querySelectorAll(".step-warning").length).toEqual(1);
    expect(warning?.getAttribute("title"))
      .toEqual("Hardware setting conflict");
    expect(container.innerHTML).toContain("Hardware setting conflict");
  });

  it("lists axes", () => {
    const { container } = render(<StepWarning
      warning={"warning"}
      conflicts={{ x: true, y: true, z: false }} />);
    const warning = container.querySelector(".step-warning");
    expect(container.querySelectorAll(".step-warning").length).toEqual(1);
    expect(warning?.getAttribute("title"))
      .toEqual("Hardware setting conflict: x, y");
    expect(container.innerHTML).toContain("Hardware setting conflict: x, y");
  });

  it("conflictsString()", () => {
    expect(conflictsString({ x: true, y: true, z: false })).toEqual("x, y");
    expect(conflictsString({ x: true, y: false, z: false })).toEqual("x");
    expect(conflictsString({ x: false, y: false, z: false })).toEqual("");
  });
});
