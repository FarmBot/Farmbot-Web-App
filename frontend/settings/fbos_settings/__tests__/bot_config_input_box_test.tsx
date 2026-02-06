import React from "react";
import { shallow } from "enzyme";
import { BotConfigInputBox, BotConfigInputBoxProps } from "../bot_config_input_box";
import * as deviceActions from "../../../devices/actions";

let updateConfigSpy: jest.SpyInstance;

beforeEach(() => {
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn() as never);
});

afterEach(() => {
  updateConfigSpy.mockRestore();
});

describe("<BotConfigInputBox />", () => {
  const fakeProps = (): BotConfigInputBoxProps => ({
    setting: "safe_height",
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: 1, consistent: true })
  });

  it("renders value: number", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    const inputBoxProps = wrapper.find("BlurableInput").props();
    expect(inputBoxProps.value).toEqual("10");
    expect(inputBoxProps.className).toEqual("");
  });

  it("doesn't render value: string", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "bad", consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    expect(wrapper.find("BlurableInput").props().value).toEqual("");
  });

  it("updates value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 0, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "10" } });
    expect(updateConfigSpy).toHaveBeenCalledWith({ safe_height: 10 });
    expect(p.dispatch).toHaveBeenCalledWith(updateConfigSpy.mock.results[0].value);
  });

  it("doesn't update value: same value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "10" } });
    expect(updateConfigSpy).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't update value: NaN", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "x" } });
    expect(updateConfigSpy).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("not consistent", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: false });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    expect(wrapper.find("BlurableInput").props().className).toEqual("dim");
  });
});
