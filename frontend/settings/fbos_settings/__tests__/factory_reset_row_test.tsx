import React from "react";
import { mount } from "enzyme";
import { FactoryResetRows } from "../factory_reset_row";
import { FactoryResetRowsProps } from "../interfaces";

describe("<FactoryResetRows />", () => {
  const fakeProps = (): FactoryResetRowsProps => ({
    botOnline: true,
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<FactoryResetRows {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("reset");
  });
});
