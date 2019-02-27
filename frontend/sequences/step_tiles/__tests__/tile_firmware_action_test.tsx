import * as React from "react";
import { TileFirmwareAction } from "../tile_firmware_action";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Reboot } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileFirmwareAction/>", () => {
  const currentStep: Reboot = {
    kind: "reboot",
    args: {
      package: "farmbot_os"
    }
  };

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
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
