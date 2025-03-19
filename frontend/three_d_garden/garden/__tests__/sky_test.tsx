import React from "react";
import { render } from "@testing-library/react";
import { Sky, SkyProps } from "../sky";
import { Vector3 } from "three";

describe("<Sky />", () => {
  const fakeProps = (): SkyProps => ({
    sunPosition: new Vector3(),
  });

  it("renders", () => {
    const { container } = render(<Sky {...fakeProps()} />);
    expect(container).toContainHTML("primitive");
  });
});
