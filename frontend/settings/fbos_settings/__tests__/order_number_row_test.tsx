jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { shallow } from "enzyme";
import { OrderNumberRow } from "../order_number_row";
import { OrderNumberRowProps } from "../interfaces";
import { edit, save } from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<OrderNumberRow />", () => {
  const fakeProps = (): OrderNumberRowProps => ({
    device: fakeDevice(),
    dispatch: mockDispatch(),
  });

  it("sets order number", () => {
    const p = fakeProps();
    const newOrderNumber = "FB1234";
    const osSettings = shallow(<OrderNumberRow {...p} />);
    osSettings.find("BlurableInput").simulate("commit", {
      currentTarget: { value: newOrderNumber }
    });
    expect(edit).toHaveBeenCalledWith(p.device, {
      fb_order_number: newOrderNumber
    });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });
});
