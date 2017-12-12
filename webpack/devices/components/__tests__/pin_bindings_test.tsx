const mockDevice = {
  registerGpio: jest.fn(() => { return Promise.resolve(); }),
  unregisterGpio: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { PinBindings, PinBindingsProps } from "../pin_bindings";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "../../../resources/tagged_resources";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<PinBindings/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): PinBindingsProps {
    const fakeResources: TaggedSequence[] = [fakeSequence(), fakeSequence()];
    fakeResources[0].body.id = 1;
    fakeResources[0].body.name = "Sequence 1";
    fakeResources[1].body.id = 2;
    fakeResources[1].body.name = "Sequence 2";
    const resources = buildResourceIndex(fakeResources).index;

    bot.hardware.gpio_registry = {
      10: "1",
      11: "2"
    };
    return {
      dispatch: jest.fn(),
      bot: bot,
      resources: resources
    };
  }

  it("renders", () => {
    const wrapper = mount(<PinBindings {...fakeProps() } />);
    ["pin bindings", "pin number", "none", "bind"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    ["pi gpio 10", "sequence 1", "pi gpio 11", "sequence 2"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find("input").length).toBe(1);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(4);
  });

  it("unregisters pin", () => {
    const dispatch = jest.fn();
    const p = fakeProps();
    p.dispatch = dispatch;
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    dispatch.mock.calls[0][0](jest.fn());
    expect(mockDevice.unregisterGpio).toHaveBeenCalledWith({
      pin_number: 10
    });
  });

  it("registers pin", () => {
    const dispatch = jest.fn();
    const p = fakeProps();
    p.dispatch = dispatch;
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    wrapper.setState({ pinNumberInput: 1, sequenceIdInput: 2 });
    buttons.last().simulate("click");
    dispatch.mock.calls[0][0](jest.fn());
    expect(mockDevice.registerGpio).toHaveBeenCalledWith({
      pin_number: 1, sequence_id: 2
    });
  });
});
