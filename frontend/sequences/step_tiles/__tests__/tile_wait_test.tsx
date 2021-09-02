import React from "react";
import { mount } from "enzyme";
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
    const block = mount(<TileWait {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Wait");
    expect(labels.at(0).text()).toEqual("Time in milliseconds");
    expect(inputs.at(1).props().value).toEqual(100);
  });
});
