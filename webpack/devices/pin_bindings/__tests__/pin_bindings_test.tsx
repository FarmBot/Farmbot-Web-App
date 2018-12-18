import * as React from "react";
import { PinBindings } from "../pin_bindings";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakePinBinding
} from "../../../__test_support__/fake_state/resources";
import { PinBindingsProps } from "../interfaces";
import {
  SpecialPinBinding,
  PinBindingType,
  PinBindingSpecialAction
} from "farmbot/dist/resources/api_resources";

describe("<PinBindings/>", () => {
  function fakeProps(): PinBindingsProps {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.id = 1;
    fakeSequence1.body.name = "Sequence 1";

    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.id = 2;
    fakeSequence2.body.name = "Sequence 2";

    const fakePinBinding1 = fakePinBinding();
    fakePinBinding1.body =
      ({ pin_num: 10, sequence_id: 2, binding_type: PinBindingType.standard });
    const fakePinBinding2 = fakePinBinding();
    fakePinBinding2.body.id = 2;
    fakePinBinding2.body.pin_num = 26;
    fakePinBinding2.body.binding_type = PinBindingType.special;

    (fakePinBinding2.body as SpecialPinBinding).special_action =
      PinBindingSpecialAction.emergency_lock;
    const resources = buildResourceIndex([
      fakeSequence1, fakeSequence2, fakePinBinding1, fakePinBinding2
    ]).index;

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

  it("renders: bot", () => {
    const wrapper = mount(<PinBindings {...fakeProps()} />);
    ["pin bindings", "pin number", "none", "bind"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    ["pi gpio 10", "sequence 1", "pi gpio 11", "sequence 2"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(6);
    expect(wrapper.text().toLowerCase()).not.toContain("stock bindings");
  });

  it("renders: api", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = mount(<PinBindings {...p} />);
    ["pin bindings", "pin number", "none", "bind", "stock bindings"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
    ["26", "action"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(7);
  });
});
