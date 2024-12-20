jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { shallow } from "enzyme";
import { BotConfigInputBox, BotConfigInputBoxProps } from "../bot_config_input_box";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";

describe("<BotConfigInputBox />", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): BotConfigInputBoxProps => ({
    setting: "safe_height",
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
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
    expect(edit).toHaveBeenCalledWith(fakeConfig, { safe_height: 10 });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("doesn't update value: same value", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "10" } });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("doesn't update value: NaN", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: true });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    wrapper.find("BlurableInput")
      .simulate("commit", { currentTarget: { value: "x" } });
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("not consistent", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 10, consistent: false });
    const wrapper = shallow(<BotConfigInputBox {...p} />);
    expect(wrapper.find("BlurableInput").props().className).toEqual("dim");
  });
});
