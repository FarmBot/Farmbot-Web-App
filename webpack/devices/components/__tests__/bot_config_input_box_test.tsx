const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { shallow } from "enzyme";
import { BotConfigInputBox, BotConfigInputBoxProps } from "../bot_config_input_box";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<BotConfigInputBox />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const fakeProps = (): BotConfigInputBoxProps => {
    return {
      setting: "network_not_found_timer",
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders value: number", () => {
    bot.hardware.configuration.network_not_found_timer = 10;
    const wrapper = shallow(<BotConfigInputBox {...fakeProps() } />);
    const inputBoxProps = wrapper.find("BlurableInput").props();
    expect(inputBoxProps.value).toEqual("10");
    expect(inputBoxProps.className).toEqual("");
  });

  it("doesn't render value: string", () => {
    // tslint:disable-next-line:no-any
    bot.hardware.configuration.network_not_found_timer = "bad" as any;
    const wrapper = shallow(<BotConfigInputBox {...fakeProps() } />);
    expect(wrapper.find("BlurableInput").props().value).toEqual("");
  });

  it("updates value", () => {
    bot.hardware.configuration.network_not_found_timer = 0;
    const p = fakeProps();
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "10" } });
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ network_not_found_timer: 10 });
  });

  it("doesn't update value: same value", () => {
    bot.hardware.configuration.network_not_found_timer = 10;
    const p = fakeProps();
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "10" } });
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
  });

  it("doesn't update value: NaN", () => {
    bot.hardware.configuration.network_not_found_timer = 10;
    const p = fakeProps();
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "x" } });
    expect(mockDevice.updateConfig).not.toHaveBeenCalled();
  });

  it("not consistent", () => {
    const p = fakeProps();
    p.sourceFbosConfig = x => { return { value: 10, consistent: false }; };
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    expect(wrapper.find("BlurableInput").props().className).toEqual("dim");
  });
});
