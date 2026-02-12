import React from "react";
import { render } from "@testing-library/react";
import { TileTogglePin } from "../tile_toggle_pin";
import { StepParams } from "../../interfaces";
import { TogglePin } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

jest.unmock("../../../ui");

describe("<TileTogglePin/>", () => {
  const fakeProps = (): StepParams<TogglePin> => ({
    ...fakeStepParams({ kind: "toggle_pin", args: { pin_number: 13 } }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileTogglePin {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);

    const text = (container.textContent || "").toLowerCase();
    expect(text).toContain("peripheral");
  });
});
