import React from "react";
import { render } from "@testing-library/react";
import { TileWait } from "../tile_wait";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { Wait } from "farmbot";

describe("<TileWait />", () => {
  const fakeProps = (): StepParams<Wait> => ({
    ...fakeStepParams({
      kind: "wait",
      args: {
        milliseconds: 100
      }
    }),
  });

  it("renders inputs", () => {
    const { container } = render(<TileWait {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Wait");
    expect(labels[0]?.textContent).toEqual("Time in milliseconds");
    expect((inputs[1] as HTMLInputElement | undefined)?.value).toEqual("100");
  });
});
