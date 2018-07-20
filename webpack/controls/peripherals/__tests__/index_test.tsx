jest.mock("farmbot-toastr", () => ({
  error: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Peripherals } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { PeripheralsProps } from "../../../devices/interfaces";
import { fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import { SpecialStatus } from "../../../resources/tagged_resources";
import { error } from "farmbot-toastr";

describe("<Peripherals />", () => {
  function fakeProps(): PeripheralsProps {
    return {
      bot,
      peripherals: [fakePeripheral()],
      dispatch: jest.fn(),
      disabled: false
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

  function attemptSave(num: number, errorString: string) {
    const p = fakeProps();
    p.peripherals[0].body.pin = num;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<Peripherals {...p} />);
    clickButton(wrapper, 1, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith(errorString);
  }

  it("save attempt: pin number too small", () => {
    attemptSave(0, "Pin numbers are required and must be positive and unique.");
  });

  it("save attempt: pin number too large", () => {
    attemptSave(9999, "Pin numbers must be less than 1000.");
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

  it("adds farmduino peripherals", () => {
    const p = fakeProps();
    const wrapper = mount(<Peripherals {...p} />);
    wrapper.setState({ isEditing: true });
    clickButton(wrapper, 3, "farmduino");
    expect(p.dispatch).toHaveBeenCalledTimes(5);
  });
});
