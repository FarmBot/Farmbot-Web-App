jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { OrderNumberRow } from "../order_number_row";
import { OrderNumberRowProps } from "../interfaces";
import { edit, save } from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<OrderNumberRow />", () => {
  const fakeProps = (): OrderNumberRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
  });

  it("changes order number", () => {
    const p = fakeProps();
    const newOrderNumber = "FB1234";
    const osSettings = mount<OrderNumberRow>(<OrderNumberRow {...p} />);
    shallow(osSettings.instance().OrderNumberInput())
      .simulate("change", { currentTarget: { value: newOrderNumber } });
    expect(edit).toHaveBeenCalledWith(p.device, {
      fb_order_number: newOrderNumber
    });
  });

  it("saves order number", () => {
    const p = fakeProps();
    const osSettings = mount<OrderNumberRow>(<OrderNumberRow {...p} />);
    shallow(osSettings.instance().OrderNumberInput()).simulate("blur");
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });
});
