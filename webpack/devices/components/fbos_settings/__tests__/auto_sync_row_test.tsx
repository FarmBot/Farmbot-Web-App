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

describe("<AutoSyncRow/>", () => {
  it("renders", () => {
    const wrapper = mount(<AutoSyncRow currentValue={true} />);
    ["AUTO SYNC", Content.AUTO_SYNC]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("toggles", () => {
    const wrapper = mount(<AutoSyncRow currentValue={true} />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ auto_sync: false });
  });
});
