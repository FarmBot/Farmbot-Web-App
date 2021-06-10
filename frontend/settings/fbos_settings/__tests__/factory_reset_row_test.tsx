let mockDisplay = false;
jest.mock("../../../farmware/state_to_props", () => ({
  shouldDisplayFeature: () => mockDisplay,
}));

import React from "react";
import { mount } from "enzyme";
import { FactoryResetRows } from "../factory_reset_row";
import { FactoryResetRowsProps } from "../interfaces";

describe("<FactoryResetRows />", () => {
  const fakeProps = (): FactoryResetRowsProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    showAdvanced: true,
  });

  it("renders", () => {
    const wrapper = mount(<FactoryResetRows {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("reset");
    expect(wrapper.text().toLowerCase()).toContain("auto");
  });

  it("doesn't show auto reset", () => {
    mockDisplay = true;
    const wrapper = mount(<FactoryResetRows {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("auto");
    expect(wrapper.text().toLowerCase()).not.toContain("timer");
  });
});
