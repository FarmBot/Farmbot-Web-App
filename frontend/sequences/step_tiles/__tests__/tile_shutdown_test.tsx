import React from "react";
import { render } from "@testing-library/react";
import { TileShutdown } from "../tile_shutdown";
import { StepParams } from "../../interfaces";
import { Content } from "../../../constants";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { PowerOff } from "farmbot";

describe("<TileShutdown />", () => {
  const fakeProps = (): StepParams<PowerOff> => ({
    ...fakeStepParams({ kind: "power_off", args: {} }),
  });

  it("renders step", () => {
    const { container } = render(<TileShutdown {...fakeProps()} />);
    expect(container.textContent).toContain(Content.SHUTDOWN_STEP);
  });
});
