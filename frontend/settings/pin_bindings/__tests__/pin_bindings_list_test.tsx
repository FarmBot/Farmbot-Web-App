const mockDevice = {
  registerGpio: jest.fn(() => Promise.resolve()),
  unregisterGpio: jest.fn(() => Promise.resolve()),
};

import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";

import React from "react";
import { mount } from "enzyme";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";
import {
  fakeSequence, fakePinBinding,
} from "../../../__test_support__/fake_state/resources";
import * as crud from "../../../api/crud";
import { PinBindingsList } from "../pin_bindings_list";
import { PinBindingsListProps } from "../interfaces";
import { sysBtnBindingData, sysBtnBindings } from "../tagged_pin_binding_init";
import { error } from "../../../toast/toast";
import * as device from "../../../device";

let getDeviceSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;

beforeEach(() => {
  getDeviceSpy = jest.spyOn(device, "getDevice")
    .mockImplementation(() => mockDevice as never);
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  sysBtnBindingData.length = 0;
  sysBtnBindings.length = 0;
  sysBtnBindingData.push({
    pin_number: 1,
    sequence_id: undefined,
    special_action: PinBindingSpecialAction.sync,
    binding_type: PinBindingType.special,
    uuid: "",
  });
  sysBtnBindings.push(1);
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  destroySpy.mockRestore();
  sysBtnBindingData.length = 0;
  sysBtnBindings.length = 0;
});

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
    ["pi gpio 10", "sequence", "pi gpio 11", "sequence"].map(string =>
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
    expect(crud.destroy).toHaveBeenCalledWith(expect.stringContaining("PinBinding"));
  });

  it("restricts deletion of built-in bindings", () => {
    const p = fakeProps();
    p.pinBindings = sysBtnBindingData;
    const wrapper = mount(<PinBindingsList {...p} />);
    const buttons = wrapper.find("button");
    buttons.first().simulate("click");
    expect(mockDevice.unregisterGpio).not.toHaveBeenCalled();
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot delete"));
  });
});
