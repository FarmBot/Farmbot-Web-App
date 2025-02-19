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
});
