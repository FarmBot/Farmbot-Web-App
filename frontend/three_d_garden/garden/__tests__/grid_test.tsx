import React from "react";
import { render } from "@testing-library/react";
import { Grid, GridProps } from "../grid";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Grid />", () => {
  const fakeProps = (): GridProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.grid = true;
    const { container } = render(<Grid {...p} />);
    expect(container).toContainHTML("grid");
  });
});
