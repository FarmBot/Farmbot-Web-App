import React from "react";
import { render } from "@testing-library/react";
import { Ground, GroundProps } from "../ground";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Ground />", () => {
  const fakeProps = (): GroundProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Ground {...fakeProps()} />);
    expect(container).toContainHTML("ground");
  });
});
