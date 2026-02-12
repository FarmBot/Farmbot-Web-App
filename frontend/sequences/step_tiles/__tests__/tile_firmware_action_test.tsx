import React from "react";
import { render } from "@testing-library/react";
import { TileFirmwareAction } from "../tile_firmware_action";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

jest.unmock("../../step_ui");
jest.unmock("../inputs/step_input_box");
jest.unmock("../../../ui");

describe("<TileFirmwareAction/>", () => {
  const fakeProps = (): StepParams => ({
    ...fakeStepParams({ kind: "reboot", args: { package: "farmbot_os" } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileFirmwareAction {...fakeProps()} />);
    const inputs = Array.from(container.querySelectorAll("input"));
    const labels = Array.from(container.querySelectorAll("label"));

    expect(container.querySelector(".firmware-action-step")).toBeTruthy();
    expect(labels.some(label =>
      (label.textContent || "").toLowerCase().includes("system"))).toBeTruthy();
    expect(inputs.some(input =>
      (input).value === "farmbot_os")).toBeTruthy();
  });
});
