import React from "react";
import { render } from "@testing-library/react";
import { Sun, SunProps } from "../sun";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Sun />", () => {
  const fakeProps = (): SunProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Sun {...fakeProps()} />);
    expect(container).toContainHTML("sun");
    expect(container).not.toContainHTML("line");
  });

  it("renders debug helpers", () => {
    const p = fakeProps();
    p.config.lightsDebug = true;
    const { container } = render(<Sun {...p} />);
    expect(container).toContainHTML("sun");
    expect(container).toContainHTML("line");
  });
});
