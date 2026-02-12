import React from "react";
import { render } from "@testing-library/react";
import { TileReadPin } from "../tile_read_pin";
import { ReadPin } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

jest.unmock("../../../ui");

describe("<TileReadPin />", () => {
  const fakeProps = (): StepParams<ReadPin> => ({
    ...fakeStepParams({
      kind: "read_pin",
      args: {
        pin_number: 3,
        label: "pinlabel",
        pin_mode: 1
      }
    }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileReadPin {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = Array.from(container.querySelectorAll("label"))
      .map(label => (label.textContent || "").toLowerCase().trim());

    expect(inputs.length).toEqual(2);
    expect(labels).toEqual(expect.arrayContaining([
      "sensor or peripheral",
      "mode",
      "data label",
    ]));
    expect(inputs[1]?.value).toEqual("pinlabel");

    const text = (container.textContent || "").toLowerCase();
    const mockedSelectCount = (text.match(/mock-scene-select/g) || []).length;
    const hasModeSelection =
      (text.includes("analog") && text.includes("digital"))
      || mockedSelectCount >= 2;
    expect(hasModeSelection).toBeTruthy();
  });
});
