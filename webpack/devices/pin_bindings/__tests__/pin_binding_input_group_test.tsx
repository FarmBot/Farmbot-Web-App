const mockDevice = {
  registerGpio: jest.fn(() => { return Promise.resolve(); }),
  unregisterGpio: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn()
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "../../../resources/tagged_resources";
import {
  fakeSequence
} from "../../../__test_support__/fake_state/resources";
import { initSave } from "../../../api/crud";
import {
  PinBindingInputGroupProps, PinBindingType, PinBindingSpecialAction
} from "../interfaces";
import {
  PinBindingInputGroup, PinNumberInputGroup, BindingTypeDropDown,
  ActionTargetDropDown, SequenceTargetDropDown
} from "../pin_binding_input_group";
import { error, warning } from "farmbot-toastr";
import {
  fakeResourceIndex
} from "../../../sequences/step_tiles/tile_move_absolute/test_helpers";

describe("<PinBindingInputGroup/>", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): PinBindingInputGroupProps {
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
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(4);
  });

  it("no pin selected", () => {
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    buttons.last().simulate("click");
    expect(error).toHaveBeenCalledWith("Pin number cannot be blank.");
  });

  it("no target selected", () => {
    const wrapper = mount(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    wrapper.setState({ pinNumberInput: 7 });
    buttons.last().simulate("click");
    expect(error).toHaveBeenCalledWith("Please select a sequence or action.");
  });

  it("registers pin: bot", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<PinBindingInputGroup {...p} />);
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
    const wrapper = mount(<PinBindingInputGroup {...p} />);
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
        binding_type: PinBindingType.standard
      }
    });
    expect(initSave).toHaveBeenCalledWith(expectedResult);
  });

  it("registers pin: api (special action)", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.shouldDisplay = () => true;
    const wrapper = mount(<PinBindingInputGroup {...p} />);
    const buttons = wrapper.find("button");
    expect(buttons.last().text()).toEqual("BIND");
    wrapper.setState({
      pinNumberInput: 2,
      bindingType: PinBindingType.special,
      sequenceIdInput: undefined,
      specialActionInput: PinBindingSpecialAction.emergency_lock
    });
    buttons.last().simulate("click");
    expect(mockDevice.registerGpio).not.toHaveBeenCalled();
    const expectedResult = expect.objectContaining({
      kind: "PinBinding",
      body: {
        pin_num: 2,
        binding_type: PinBindingType.special,
        special_action: PinBindingSpecialAction.emergency_lock
      }
    });
    expect(initSave).toHaveBeenCalledWith(expectedResult);
  });

  it("sets sequence id", () => {
    const p = fakeProps();
    const s = p.resources.references[p.resources.byKind.Sequence[0]];
    const id = s && s.body.id;
    const wrapper = mount<PinBindingInputGroup>(<PinBindingInputGroup {...p} />);
    expect(wrapper.instance().state.sequenceIdInput).toEqual(undefined);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.setSequenceIdInput({ label: "label", value: id });
    expect(wrapper.instance().state.sequenceIdInput).toEqual(id);
  });

  it("sets pin", () => {
    const wrapper = mount<PinBindingInputGroup>(<PinBindingInputGroup {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.setSelectedPin(10); // pin already bound
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(99); // invalid pin
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(5); // available pin
    expect(wrapper.instance().state.pinNumberInput).toEqual(5);
    instance.setSelectedPin(1); // reserved pin
    expect(wrapper.instance().state.pinNumberInput).toEqual(1);
    expect(warning).toHaveBeenCalledWith(
      "Reserved Raspberry Pi pin may not work as expected.");
  });

  it("changes pin number", () => {
    const wrapper = shallow<PinBindingInputGroup>(<PinBindingInputGroup {...fakeProps()} />);
    expect(wrapper.instance().state.pinNumberInput).toEqual(undefined);
    wrapper.instance().setSelectedPin(7);
    expect(wrapper.instance().state.pinNumberInput).toEqual(7);
  });

  it("changes binding type", () => {
    const wrapper = shallow<PinBindingInputGroup>(<PinBindingInputGroup {...fakeProps()} />);
    expect(wrapper.instance().state.bindingType).toEqual(PinBindingType.standard);
    wrapper.instance().setBindingType({ label: "", value: PinBindingType.special });
    expect(wrapper.instance().state.bindingType).toEqual(PinBindingType.special);
  });

  it("changes special action", () => {
    const wrapper = shallow<PinBindingInputGroup>(<PinBindingInputGroup {...fakeProps()} />);
    wrapper.setState({ bindingType: PinBindingType.special });
    expect(wrapper.instance().state.specialActionInput).toEqual(undefined);
    wrapper.instance().setSpecialAction({ label: "", value: PinBindingSpecialAction.sync });
    expect(wrapper.instance().state.specialActionInput)
      .toEqual(PinBindingSpecialAction.sync);
  });
});

describe("<PinNumberInputGroup />", () => {
  it("sets pin", () => {
    const setSelectedPin = jest.fn();
    const wrapper = shallow(<PinNumberInputGroup
      pinNumberInput={undefined}
      boundPins={[]}
      setSelectedPin={setSelectedPin} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: 7 });
    expect(setSelectedPin).toHaveBeenCalledWith(7);
  });
});

describe("<BindingTypeDropDown />", () => {
  it("sets binding type", () => {
    const setBindingType = jest.fn();
    const wrapper = shallow(<BindingTypeDropDown
      bindingType={PinBindingType.standard}
      shouldDisplay={() => true}
      setBindingType={setBindingType} />);
    const ddi = { label: "", value: PinBindingType.special };
    wrapper.find("FBSelect").simulate("change", ddi);
    expect(setBindingType).toHaveBeenCalledWith(ddi);
  });
});

describe("<ActionTargetDropDown />", () => {
  it("sets action", () => {
    const setSpecialAction = jest.fn();
    const wrapper = shallow(<ActionTargetDropDown
      specialActionInput={undefined}
      setSpecialAction={setSpecialAction} />);
    const ddi = { label: "", value: PinBindingSpecialAction.sync };
    wrapper.find("FBSelect").simulate("change", ddi);
    expect(setSpecialAction).toHaveBeenCalledWith(ddi);
  });
});

describe("<SequenceTargetDropDown />", () => {
  it("sets action", () => {
    const setSequenceIdInput = jest.fn();
    const wrapper = shallow(<SequenceTargetDropDown
      sequenceIdInput={undefined}
      resources={fakeResourceIndex()}
      setSequenceIdInput={setSequenceIdInput} />);
    const ddi = { label: "", value: 1 };
    wrapper.find("SequenceSelectBox").simulate("change", ddi);
    expect(setSequenceIdInput).toHaveBeenCalledWith(ddi);
  });
});
