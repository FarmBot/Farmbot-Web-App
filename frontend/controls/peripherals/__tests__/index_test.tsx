import * as React from "react";
import { mount } from "enzyme";
import { Peripherals } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { PeripheralsProps } from "../../../devices/interfaces";
import { fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import { SpecialStatus, FirmwareHardware } from "farmbot";
import { error } from "../../../toast/toast";

describe("<Peripherals />", () => {
  function fakeProps(): PeripheralsProps {
    return {
      bot,
      peripherals: [fakePeripheral()],
      dispatch: jest.fn(),
      disabled: false,
      firmwareHardware: undefined,
    };
  }

  it("renders", () => {
    const wrapper = mount(<Peripherals {...fakeProps()} />);
    ["Peripherals", "Edit", "Save", "Fake Pin", "1"].map(string =>
      expect(wrapper.text()).toContain(string));
    const saveButton = wrapper.find("button").at(1);
    expect(saveButton.text()).toContain("Save");
    expect(saveButton.props().hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const wrapper = mount<Peripherals>(<Peripherals {...fakeProps()} />);
    expect(wrapper.instance().state.isEditing).toBeFalsy();
    clickButton(wrapper, 0, "edit");
    expect(wrapper.instance().state.isEditing).toBeTruthy();
  });

  it("save attempt: pin number undefined", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = undefined;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith("Please select a pin.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("save attempt: pin number not unique", () => {
    const p = fakeProps();
    p.peripherals = [fakePeripheral(), fakePeripheral()];
    p.peripherals[0].body.pin = 1;
    p.peripherals[1].body.pin = 1;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith("Pin numbers must be unique.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("saves", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = 1;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds empty peripheral", () => {
    const p = fakeProps();
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, 2, "");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 2],
    ["farmduino", 5],
    ["farmduino_k14", 5],
    ["farmduino_k15", 5],
    ["express_k10", 3],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, 3, "stock");
    expect(p.dispatch).toHaveBeenCalledTimes(expectedAdds);
  });

  it("hides stock button", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    const btn = wrapper.find("button").at(3);
    expect(btn.text().toLowerCase()).toContain("stock");
    expect(btn.props().hidden).toBeTruthy();
  });
});
