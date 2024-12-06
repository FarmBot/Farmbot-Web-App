const mockDevice = {
  registerGpio: jest.fn(() => Promise.resolve()),
  unregisterGpio: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({ destroy: jest.fn() }));

import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
const mockData = [{
  pin_number: 1, sequence_id: undefined,
  special_action: PinBindingSpecialAction.sync,
  binding_type: PinBindingType.special,
  uuid: ""
}];
jest.mock("../tagged_pin_binding_init", () => ({
  sysBtnBindingData: mockData,
  sysBtnBindings: [1]
}));

import React from "react";
import { mount } from "enzyme";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";
import {
  fakeSequence, fakePinBinding,
} from "../../../__test_support__/fake_state/resources";
import { destroy } from "../../../api/crud";
import { PinBindingsList } from "../pin_bindings_list";
import { PinBindingsListProps } from "../interfaces";
import { sysBtnBindingData } from "../tagged_pin_binding_init";
import { error } from "../../../toast/toast";

describe("<PinBindingsList/>", () => {
  function fakeProps(): PinBindingsListProps {
    const fakeResources: TaggedSequence[] = [fakeSequence(), fakeSequence()];
    fakeResources[0].body.id = 1;
    fakeResources[0].body.name = "Sequence 1";
    fakeResources[1].body.id = 2;
    fakeResources[1].body.name = "Sequence 2";
    const resources = buildResourceIndex(fakeResources).index;

    return {
      pinBindings: [
        { pin_number: 10, sequence_id: 1 },
        { pin_number: 11, sequence_id: 2 },
      ],
      dispatch: jest.fn(),
      resources: resources,
    };
  }

  it("renders", () => {
    const wrapper = mount(<PinBindingsList {...fakeProps()} />);
    ["pi gpio 10", "sequence 1", "pi gpio 11", "sequence 2"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(2);
  });

  it("unregisters pin: api", () => {
    const p = fakeProps();
    const s = fakeSequence();
    s.body.id = 1;
    const b = fakePinBinding();
    p.resources = buildResourceIndex([b, s]).index;
    p.pinBindings = [{ pin_number: 10, sequence_id: 1, uuid: b.uuid }];
    const wrapper = mount(<PinBindingsList {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(expect.stringContaining("PinBinding"));
  });

  it("restricts deletion of built-in bindings", () => {
    const p = fakeProps();
    p.pinBindings = sysBtnBindingData;
    const wrapper = mount(<PinBindingsList {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).not.toHaveBeenCalled();
    expect(destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot delete"));
  });
});
