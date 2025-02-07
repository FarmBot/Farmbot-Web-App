import React from "react";
import { render } from "@testing-library/react";
import { Desk, DeskProps } from "../desk";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<Desk />", () => {
  const fakeProps = (): DeskProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<Desk {...fakeProps()} />);
    expect(container).toContainHTML("desk");
  });
});
