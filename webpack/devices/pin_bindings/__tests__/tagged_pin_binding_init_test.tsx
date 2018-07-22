jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { StockPinBindingsButton } from "../tagged_pin_binding_init";
import { initSave } from "../../../api/crud";
import { stockPinBindings } from "../list_and_label_support";

describe("<StockPinBindingsButton />", () => {
  const fakeProps = () => ({
    shouldDisplay: () => false,
    dispatch: jest.fn(),
  });

  it("doesn't render button", () => {
    const wrapper = mount(<StockPinBindingsButton {...fakeProps()} />);
    expect(wrapper.find("button").length).toEqual(0);
  });

  it("adds bindings", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = mount(<StockPinBindingsButton {...p} />);
    wrapper.find("button").simulate("click");
    stockPinBindings.map(body =>
      expect(initSave).toHaveBeenCalledWith(expect.objectContaining({
        kind: "PinBinding", body
      })));
  });
});
