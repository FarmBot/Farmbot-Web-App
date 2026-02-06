import React from "react";
import { FactoryResetRows } from "../factory_reset_row";
import { FactoryResetRowsProps } from "../interfaces";
import { mountWithContext } from "../../../__test_support__/mount_with_context";

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("<FactoryResetRows />", () => {
  const fakeProps = (): FactoryResetRowsProps => ({
    botOnline: true,
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mountWithContext(<FactoryResetRows {...fakeProps()} />);
    expect(wrapper.exists()).toBeTruthy();
  });
});
