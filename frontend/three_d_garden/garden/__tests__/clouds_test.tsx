import React from "react";
import { render } from "@testing-library/react";
import { Clouds, CloudsProps } from "../clouds";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Clouds />", () => {
  const fakeProps = (): CloudsProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Clouds {...fakeProps()} />);
    expect(container).toContainHTML("clouds");
  });
});
