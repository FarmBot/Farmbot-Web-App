const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
  sync: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { AutoSyncRow } from "../auto_sync_row";
import { mount } from "enzyme";
import { Content } from "../../../../constants";
import { AutoSyncRowProps } from "../interfaces";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<AutoSyncRow/>", () => {
  const fakeProps = (): AutoSyncRowProps => {
    return {
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders", () => {
    const wrapper = mount<{}>(<AutoSyncRow {...fakeProps() } />);
    ["AUTO SYNC", Content.AUTO_SYNC]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("toggles", () => {
    bot.hardware.configuration.auto_sync = true;
    const wrapper = mount<{}>(<AutoSyncRow {...fakeProps() } />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ auto_sync: false });
  });
});
