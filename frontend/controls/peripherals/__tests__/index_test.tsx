import React from "react";
import { mount } from "enzyme";
import { Peripherals } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { PeripheralsProps } from "../interfaces";
import { fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import { SpecialStatus, FirmwareHardware } from "farmbot";
import { error } from "../../../toast/toast";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<Peripherals />", () => {
  const fakeProps = (): PeripheralsProps => ({
    bot,
    peripherals: [fakePeripheral()],
    dispatch: jest.fn(),
    firmwareHardware: undefined,
    resources: buildResourceIndex([]).index,
    getConfigValue: () => false,
  });

  it("renders", () => {
    const wrapper = mount(<Peripherals {...fakeProps()} />);
    ["Edit", "Save", "Fake Pin", "1"].map(string =>
      expect(wrapper.text()).toContain(string));
    const btnCount = wrapper.find("button").length;
    const saveButton = wrapper.find("button").at(btnCount - 3);
    expect(saveButton.text()).toContain("Save");
    expect(saveButton.props().hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const wrapper = mount<Peripherals>(<Peripherals {...fakeProps()} />);
    expect(wrapper.instance().state.isEditing).toBeFalsy();
    clickButton(wrapper, 1, "edit");
    expect(wrapper.instance().state.isEditing).toBeTruthy();
  });

  it("save attempt: pin number undefined", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = undefined;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, -3, "save", { partial_match: true });
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
    clickButton(wrapper, -3, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith("Pin numbers must be unique.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("saves", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = 1;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, -3, "save", { partial_match: true });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds empty peripheral", () => {
    const p = fakeProps();
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, -2, "");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 2],
    ["farmduino", 5],
    ["farmduino_k14", 5],
    ["farmduino_k15", 5],
    ["farmduino_k16", 7],
    ["farmduino_k17", 7],
    ["farmduino_k18", 7],
    ["express_k10", 3],
    ["express_k11", 3],
    ["express_k12", 3],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, -1, "stock");
    expect(p.dispatch).toHaveBeenCalledTimes(expectedAdds);
  });

  it("hides stock button", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    const btnCount = wrapper.find("button").length;
    const btn = wrapper.find("button").at(btnCount - 1);
    expect(btn.text().toLowerCase()).toContain("stock");
    expect(btn.props().hidden).toBeTruthy();
  });

  it("renders empty state", () => {
    const p = fakeProps();
    p.peripherals = [];
    const wrapper = mount(<Peripherals {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("no peripherals yet");
  });

  it("doesn't render empty state", () => {
    const p = fakeProps();
    p.peripherals = [];
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    expect(wrapper.text().toLowerCase()).not.toContain("no peripherals yet");
  });
});
