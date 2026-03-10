import React from "react";
import { render } from "@testing-library/react";
import { FarmbotAxes, FarmbotAxesProps } from "../farmbot_axes";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<FarmbotAxes />", () => {
  const fakeProps = (): FarmbotAxesProps => ({
    config: clone(INITIAL)
  });

  it("renders", () => {
    const { container } = render(<FarmbotAxes {...fakeProps()} />);
    expect(container.innerHTML).toContain("extrude");
  });
});
