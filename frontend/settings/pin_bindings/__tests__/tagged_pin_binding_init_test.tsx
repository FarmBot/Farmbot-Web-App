jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  StockPinBindingsButton, StockPinBindingsButtonProps,
} from "../tagged_pin_binding_init";
import { initSave } from "../../../api/crud";
import { stockPinBindings } from "../list_and_label_support";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<StockPinBindingsButton />", () => {
  const fakeProps = (): StockPinBindingsButtonProps => ({
    dispatch: jest.fn(),
    firmwareHardware: undefined,
  });

  it("adds bindings", () => {
    const { container } = render(<StockPinBindingsButton {...fakeProps()} />);
    const button = container.querySelector("button");
    button && fireEvent.click(button);
    stockPinBindings.map(body =>
      expect(initSave).toHaveBeenCalledWith("PinBinding", body));
  });

  it("is hidden", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const { container } = render(<StockPinBindingsButton {...p} />);
    expect(container.querySelector("button")?.hidden).toBeTruthy();
  });

  it("is not hidden", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k14";
    const { container } = render(<StockPinBindingsButton {...p} />);
    expect(container.querySelector("button")?.hidden).toBeFalsy();
  });
});
