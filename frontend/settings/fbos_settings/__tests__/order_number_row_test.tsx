import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderNumberRow } from "../order_number_row";
import { OrderNumberRowProps } from "../interfaces";
import * as crud from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
});
describe("<OrderNumberRow />", () => {
  const fakeProps = (): OrderNumberRowProps => ({
    device: fakeDevice(),
    dispatch: mockDispatch(),
  });

  it("sets order number", () => {
    const p = fakeProps();
    const newOrderNumber = "FB1234";
    render(<OrderNumberRow {...p} />);
    changeBlurableInputRTL(
      screen.getByRole("textbox", { hidden: true }),
      newOrderNumber,
    );
    expect(crud.edit).toHaveBeenCalledWith(p.device, {
      fb_order_number: newOrderNumber,
    });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
  });
});
