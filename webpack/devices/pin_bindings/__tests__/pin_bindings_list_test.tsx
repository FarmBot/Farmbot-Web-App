const mockDevice = {
  registerGpio: jest.fn(() => { return Promise.resolve(); }),
  unregisterGpio: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "../../../resources/tagged_resources";
import {
  fakeSequence, fakePinBinding
} from "../../../__test_support__/fake_state/resources";
import { destroy } from "../../../api/crud";
import { PinBindingsList } from "../pin_bindings_list";
import { PinBindingsListProps } from "../interfaces";
import { error } from "farmbot-toastr";
import { sysBtnBindingData } from "../list_and_label_support";

describe("<PinBindingsList/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

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
      shouldDisplay: () => false,
    };
  }

  it("renders", () => {
    const wrapper = mount(<PinBindingsList {...fakeProps()} />);
    ["pi gpio 10", "sequence 1", "pi gpio 11", "sequence 2"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(2);
  });

  it("unregisters pin: bot", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<PinBindingsList {...p} />);
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
    const b = fakePinBinding();
    p.resources = buildResourceIndex([b, s]).index;
    p.shouldDisplay = () => true;
    p.pinBindings = [{ pin_number: 10, sequence_id: 1, uuid: b.uuid }];
    const wrapper = mount(<PinBindingsList {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(expect.stringContaining("PinBinding"));
  });

  it("restricts deletion of built-in bindings", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
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
