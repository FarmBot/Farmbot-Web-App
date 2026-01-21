import React from "react";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { ElectronicsBox, ElectronicsBoxProps } from "../electronics_box";

describe("<ElectronicsBox />", () => {
  const fakeProps = (): ElectronicsBoxProps => ({
    config: clone(INITIAL),
  });

  it("renders box", () => {
    const { container } = render(<ElectronicsBox {...fakeProps()} />);
    expect(container).toContainHTML("electronics-box");
  });

  it("renders kit-specific buttons", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container, rerender } = render(<ElectronicsBox {...p} />);
    expect(container.querySelectorAll("[name='button-group']").length).toBe(5);
    const v18 = fakeProps();
    v18.config.kitVersion = "v1.8";
    rerender(<ElectronicsBox {...v18} />);
    expect(container.querySelectorAll("[name='button-group']").length).toBe(3);
  });
});
