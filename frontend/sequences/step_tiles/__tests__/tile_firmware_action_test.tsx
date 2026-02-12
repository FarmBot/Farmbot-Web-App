import React from "react";
import { render } from "@testing-library/react";
import { TileFirmwareAction } from "../tile_firmware_action";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileFirmwareAction/>", () => {
  const fakeProps = (): StepParams => ({
    ...fakeStepParams({ kind: "reboot", args: { package: "farmbot_os" } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileFirmwareAction {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect((inputs[0] as HTMLInputElement).placeholder).toEqual("Reboot");
    expect((labels[0] as HTMLElement).textContent).toContain("System");
    expect((inputs[1] as HTMLInputElement).value).toEqual("farmbot_os");
  });
});
