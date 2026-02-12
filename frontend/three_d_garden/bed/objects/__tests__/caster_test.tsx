import React from "react";
import { render } from "@testing-library/react";
import { Caster, CasterProps } from "../caster";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<Caster />", () => {
  const fakeProps = (): CasterProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Caster {...fakeProps()} />);
    expect(container.innerHTML).toContain("cylinder");
    expect(container.innerHTML).toContain("extrude");
  });
});
