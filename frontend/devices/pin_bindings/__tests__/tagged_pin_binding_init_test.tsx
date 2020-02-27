jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import {
  StockPinBindingsButton, StockPinBindingsButtonProps
} from "../tagged_pin_binding_init";
import { initSave } from "../../../api/crud";
import { stockPinBindings } from "../list_and_label_support";

describe("<StockPinBindingsButton />", () => {
  const fakeProps = (): StockPinBindingsButtonProps => ({
    dispatch: jest.fn(),
    firmwareHardware: undefined,
  });

  it("adds bindings", () => {
    const wrapper = mount(<StockPinBindingsButton {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    stockPinBindings.map(body =>
      expect(initSave).toHaveBeenCalledWith("PinBinding", body));
  });

  it("is hidden", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const wrapper = mount(<StockPinBindingsButton {...p} />);
    expect(wrapper.find("button").props().hidden).toBeTruthy();
  });

  it("is not hidden", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k14";
    const wrapper = mount(<StockPinBindingsButton {...p} />);
    expect(wrapper.find("button").props().hidden).toBeFalsy();
  });
});
