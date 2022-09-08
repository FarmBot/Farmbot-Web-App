const mockDevice = {
  registerGpio: jest.fn(() => Promise.resolve()),
  unregisterGpio: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { validGpioPins } from "../list_and_label_support";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";
import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { initSave } from "../../../api/crud";
import { PinBindingInputGroupProps } from "../interfaces";
import {
  PinBindingInputGroup,
  PinNumberInputGroup,
  BindingTargetDropdown,
  BindingTargetDropdownProps,
  PinNumberInputGroupProps,
} from "../pin_binding_input_group";
import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
import { error, warning } from "../../../toast/toast";

const AVAILABLE_PIN = 18;

describe("<PinBindingInputGroup/>", () => {
  const fakeProps = (): PinBindingInputGroupProps => {
    const fakeResources: TaggedSequence[] = [fakeSequence(), fakeSequence()];
    fakeResources[0].body.id = 1;
    fakeResources[0].body.name = "Sequence 1";
    fakeResources[1].body.id = 2;
    fakeResources[1].body.name = "Sequence 2";
    const resources = buildResourceIndex(fakeResources).index;
    return {
      pinBindings: [
        { pin_number: 4, sequence_id: 1 },
        { pin_number: 5, sequence_id: 2 },
      ],
      dispatch: jest.fn(),
      resources: resources,
      firmwareHardware: undefined,
    };
  };

  it("renders", () => {
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(3);
  });

  it("no pin selected", () => {
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().props().title).toEqual("BIND");
    buttons.last().simulate("click");
    expect(error).toHaveBeenCalledWith("Pin number cannot be blank.");
  });

  it("no target selected", () => {
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().props().title).toEqual("BIND");
    wrapper.setState({ pinNumberInput: AVAILABLE_PIN });
    buttons.last().simulate("click");
    expect(error).toHaveBeenCalledWith("Please select a sequence or action.");
  });

  it("registers pin: api", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = mount(<PinBindingInputGroup {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().props().title).toEqual("BIND");
    wrapper.setState({ pinNumberInput: 1, sequenceIdInput: 2 });
    buttons.last().simulate("click");
    expect(mockDevice.registerGpio).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("PinBinding",
      {
        pin_num: 1,
        sequence_id: 2,
        binding_type: PinBindingType.standard
      });
  });

  it("registers pin: api (special action)", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = mount(<PinBindingInputGroup {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().props().title).toEqual("BIND");
    wrapper.setState({
      pinNumberInput: 0,
      bindingType: PinBindingType.special,
      sequenceIdInput: undefined,
      specialActionInput: PinBindingSpecialAction.emergency_lock
    });
    buttons.last().simulate("click");
    expect(mockDevice.registerGpio).not.toHaveBeenCalled();
    expect(initSave).toHaveBeenCalledWith("PinBinding",
      {
        pin_num: 0,
        binding_type: PinBindingType.special,
        special_action: PinBindingSpecialAction.emergency_lock
      });
  });

  it("sets sequence id", () => {
    const p = fakeProps();
    const key = Object.keys(p.resources.byKind.Sequence)[0];
    const s = p.resources.references[key];
    const id = s?.body.id;
    const wrapper = mount<PinBindingInputGroup>(<PinBindingInputGroup {...p} />);
    expect(wrapper.instance().state.sequenceIdInput).toEqual(undefined);
    wrapper.instance().changeBinding({
      label: "label", value: "" + id,
      headingId: PinBindingType.standard
    });
    expect(wrapper.instance().state.sequenceIdInput).toEqual(id);
  });

  it("attempts to set pin 99", () => {
    const wrapper = shallow<PinBindingInputGroup>(
      <PinBindingInputGroup {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    wrapper.instance().setSelectedPin(99);
    expect(error).toHaveBeenCalledWith(
      "Invalid Raspberry Pi GPIO pin number.");
    expect(warning).not.toHaveBeenCalled();
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
  });

  it("attempts to set pin 1", () => {
    expect(validGpioPins.length).toBeGreaterThan(0);
    const wrapper = shallow<PinBindingInputGroup>(
      <PinBindingInputGroup {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    wrapper.instance().setSelectedPin(1);
    expect(error).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(
      "Reserved Raspberry Pi pin may not work as expected.");
    expect(wrapper.instance().state.pinNumberInput).toEqual(1);
  });

  it("rejects pin already in use", () => {
    const p = fakeProps();
    const wrapper = mount<PinBindingInputGroup>(<PinBindingInputGroup {...p} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    const { pin_number } = p.pinBindings[0];
    wrapper.instance().setSelectedPin(pin_number);
    expect(error).toHaveBeenCalledWith(
      "Raspberry Pi GPIO pin already bound or in use.");
    expect(warning).not.toHaveBeenCalled();
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
  });

  it("changes pin number to available pin", () => {
    expect(validGpioPins.length).toBeGreaterThan(0);
    const wrapper = shallow<PinBindingInputGroup>(<PinBindingInputGroup
      {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    wrapper.instance().setSelectedPin(AVAILABLE_PIN);
    expect(error).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
    expect(wrapper.instance().state.pinNumberInput).toEqual(AVAILABLE_PIN);
  });

  it("changes special action", () => {
    const wrapper = shallow<PinBindingInputGroup>(<PinBindingInputGroup
      {...fakeProps()} />);
    wrapper.instance().changeBinding({
      label: "",
      value: PinBindingSpecialAction.sync,
      headingId: PinBindingType.special,
    });
    expect(wrapper.instance().state.specialActionInput)
      .toEqual(PinBindingSpecialAction.sync);
  });
});

describe("<PinNumberInputGroup />", () => {
  const fakeProps = (): PinNumberInputGroupProps => ({
    pinNumberInput: undefined,
    boundPins: [],
    setSelectedPin: jest.fn(),
    firmwareHardware: undefined,
  });

  it("sets pin", () => {
    const p = fakeProps();
    const wrapper = shallow(<PinNumberInputGroup {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "", value: AVAILABLE_PIN
    });
    expect(p.setSelectedPin).toHaveBeenCalledWith(AVAILABLE_PIN);
  });
});

describe("<BindingTargetDropdown />", () => {
  const fakeProps = (): BindingTargetDropdownProps => {
    const sequence0 = fakeSequence();
    sequence0.body.id = undefined;
    const sequence1 = fakeSequence();
    sequence1.body.id = 1;
    const sequence2 = fakeSequence();
    sequence2.body.id = 2;
    return {
      change: jest.fn(),
      resources: buildResourceIndex([sequence0, sequence1, sequence2]).index,
      sequenceIdInput: undefined,
      specialActionInput: undefined,
    };
  };

  it("shows sequence selected", () => {
    const p = fakeProps();
    p.sequenceIdInput = 1;
    const wrapper = shallow(<BindingTargetDropdown {...p} />);
    expect(wrapper.find("FBSelect").props().selected).toEqual(undefined);
  });

  it("shows action selected", () => {
    const p = fakeProps();
    p.specialActionInput = PinBindingSpecialAction.sync;
    const wrapper = shallow(<BindingTargetDropdown {...p} />);
    expect(wrapper.find("FBSelect").props().selected).toEqual(undefined);
  });

  it("shows nothing selected", () => {
    const wrapper = shallow(<BindingTargetDropdown {...fakeProps()} />);
    expect(wrapper.find("FBSelect").props().selected).toEqual(undefined);
  });

  it("shows sequences", () => {
    const p = fakeProps();
    p.sequenceIdInput = 1;
    const wrapper = shallow(<BindingTargetDropdown {...p} />);
    const { list } = wrapper.find("FBSelect").props();
    expect(list?.length).toEqual(11);
    expect(list).toContainEqual({
      isNull: true,
      label: "None",
      value: "",
    });
    expect(list).toContainEqual({
      heading: true,
      headingId: PinBindingType.special,
      label: "Actions",
      value: 0,
    });
    expect(list).toContainEqual({
      headingId: PinBindingType.special,
      label: "Sync",
      value: "sync",
    });
    expect(list).toContainEqual({
      heading: true,
      headingId: PinBindingType.standard,
      label: "Sequences",
      value: 0,
    });
    expect(list).toContainEqual({
      headingId: PinBindingType.standard,
      label: "fake",
      value: 2,
    });
    expect(list).not.toContainEqual({
      headingId: PinBindingType.standard,
      label: "fake",
      value: 1,
    });
    expect(list).not.toContainEqual({
      headingId: PinBindingType.standard,
      label: "fake",
      value: undefined,
    });
  });
});
