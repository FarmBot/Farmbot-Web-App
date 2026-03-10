import React from "react";
import { render } from "@testing-library/react";
import { PowerSupply, PowerSupplyProps } from "../power_supply";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<PowerSupply />", () => {
  const fakeProps = (): PowerSupplyProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<PowerSupply {...fakeProps()} />);
    expect(container.innerHTML).toContain("powerSupplyGroup");
    expect(container.innerHTML).toContain("#222");
    expect(container.innerHTML).not.toContain("hsl(");
  });

  it("renders cable debug mode", () => {
    const p = fakeProps();
    p.config.cableDebug = true;
    const { container } = render(<PowerSupply {...p} />);
    expect(container.innerHTML).toContain("hsl(");
    expect(container.innerHTML).not.toContain("#222");
  });
});
