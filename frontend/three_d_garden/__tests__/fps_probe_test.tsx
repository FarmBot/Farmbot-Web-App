import React from "react";
import { render } from "@testing-library/react";
import { FPSProbe } from "../fps_probe";

describe("FPSProbe", () => {
  it("sets window.__fps", () => {
    let t = 0;
    jest.spyOn(performance, "now").mockImplementation(() => {
      t += 3000;
      return t;
    });
    render(<FPSProbe />);
    expect(window.__fps).toEqual(0);
  });
});
