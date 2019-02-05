const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { AutoUpdateRow } from "../auto_update_row";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { AutoUpdateRowProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";

describe("<AutoUpdateRow/>", () => {
  const fakeProps = (): AutoUpdateRowProps => {
    return {
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders", () => {
    const wrapper = mount(<AutoUpdateRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("auto update");
  });

  it("toggles auto-update on", () => {
    bot.hardware.configuration.os_auto_update = 0;
    const wrapper = mount(<AutoUpdateRow {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ os_auto_update: 1 });
  });

  it("toggles auto-update off", () => {
    bot.hardware.configuration.os_auto_update = 1;
    const wrapper = mount(<AutoUpdateRow {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ os_auto_update: 0 });
  });
});
