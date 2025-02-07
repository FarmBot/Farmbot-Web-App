import React from "react";
import { render } from "@testing-library/react";
import { Solar, SolarProps } from "../solar";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Solar />", () => {
  const fakeProps = (): SolarProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.solar = true;
    const { container } = render(<Solar {...p} />);
    expect(container).toContainHTML("solar");
  });
});
