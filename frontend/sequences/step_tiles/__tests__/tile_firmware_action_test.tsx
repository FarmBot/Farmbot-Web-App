import React from "react";
import { mount } from "enzyme";
import { TileFirmwareAction } from "../tile_firmware_action";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileFirmwareAction/>", () => {
  const fakeProps = (): StepParams => ({
    ...fakeStepParams({ kind: "reboot", args: { package: "farmbot_os" } }),
  });

  it("renders inputs", () => {
    const block = mount(<TileFirmwareAction {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Reboot");
    expect(labels.at(0).text()).toContain("System");
    expect(inputs.at(1).props().value).toEqual("farmbot_os");
  });
});
