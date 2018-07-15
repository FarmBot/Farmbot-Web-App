const mockDevice = {
  registerGpio: jest.fn(() => { return Promise.resolve(); }),
  unregisterGpio: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
  initSave: jest.fn()
}));

import * as React from "react";
import { PinBindings, PinBindingsProps } from "../pin_bindings";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "../../../resources/tagged_resources";
import {
  fakeSequence, fakePinBinding
} from "../../../__test_support__/fake_state/resources";
import { destroy, initSave } from "../../../api/crud";

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
      resources: resources,
      botToMqttStatus: "up",
      shouldDisplay: () => false,
    };
  }

  it("renders", () => {
    const wrapper = mount(<PinBindings {...fakeProps()} />);
    ["pin bindings", "pin number", "none", "bind"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    ["pi gpio 10", "sequence 1", "pi gpio 11", "sequence 2"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find("input").length).toBe(1);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(4);
  });

  it("unregisters pin: bot", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).toHaveBeenCalledWith({
      pin_number: 10
    });
  });

  it("unregisters pin: api", () => {
    const p = fakeProps();
    const s = fakeSequence();
    s.body.id = 1;
    p.resources = buildResourceIndex([fakePinBinding(), s]).index;
    p.shouldDisplay = () => true;
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(expect.stringContaining("PinBinding"));
  });

  it("registers pin: bot", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    wrapper.setState({ pinNumberInput: 1, sequenceIdInput: 2 });
    buttons.last().simulate("click");
    expect(mockDevice.registerGpio).toHaveBeenCalledWith({
      pin_number: 1, sequence_id: 2
    });
  });

  it("registers pin: api", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.shouldDisplay = () => true;
    const wrapper = mount(<PinBindings {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    wrapper.setState({ pinNumberInput: 1, sequenceIdInput: 2 });
    buttons.last().simulate("click");
    expect(mockDevice.registerGpio).not.toHaveBeenCalled();
    const expectedResult = expect.objectContaining({
      kind: "PinBinding",
      body: {
        pin_num: 1,
        sequence_id: 2,
        binding_type: "standard"
      }
    });
    expect(initSave).toHaveBeenCalledWith(expectedResult);
  });

  it("sets sequence id", () => {
    const p = fakeProps();
    const s = p.resources.references[p.resources.byKind.Sequence[0]];
    const id = s && s.body.id;
    const wrapper = mount<PinBindings>(<PinBindings {...p} />);
    expect(wrapper.instance().state.sequenceIdInput).toEqual(undefined);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.changeSelection({ label: "label", value: id });
    expect(wrapper.instance().state.sequenceIdInput).toEqual(id);
  });

  it("sets pin", () => {
    const wrapper = mount<PinBindings>(<PinBindings {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.setSelectedPin(10);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(99);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(5);
    expect(wrapper.instance().state.pinNumberInput).toEqual(5);
  });
});
