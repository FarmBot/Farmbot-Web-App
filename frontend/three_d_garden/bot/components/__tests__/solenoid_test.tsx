import React from "react";
import { render } from "@testing-library/react";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { Solenoid, SolenoidProps } from "../solenoid";

describe("<Solenoid />", () => {
  const fakeProps = (): SolenoidProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders solenoid", () => {
    const { container } = render(<Solenoid {...fakeProps()} />);
    expect(container).toContainHTML("solenoid");
  });
});
