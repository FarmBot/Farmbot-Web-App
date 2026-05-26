const mockDevice = {
  registerGpio: jest.fn(() => Promise.resolve()),
  unregisterGpio: jest.fn(() => Promise.resolve()),
};
import * as deviceModule from "../../../device";

import React from "react";
import { validGpioPins } from "../list_and_label_support";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { TaggedSequence } from "farmbot";
import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { initSave } from "../../../api/crud";
import * as crud from "../../../api/crud";
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
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
} from "../../../__test_support__/test_renderer";

let getDeviceSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let fbSelectMock: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  fbSelectMock = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((_props: FBSelectProps) => <div />) as never);
  mockDevice.registerGpio = jest.fn(() => Promise.resolve());
  mockDevice.unregisterGpio = jest.fn(() => Promise.resolve());
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  initSaveSpy.mockRestore();
  fbSelectMock.mockRestore();
});

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

  const createInstance = (p = fakeProps()) => {
    const instance = new PinBindingInputGroup(p);
    jest.spyOn(instance, "setState").mockImplementation(update => {
      Object.assign(instance.state, update);
    });
    return instance;
  };

  it("renders", () => {
    const wrapper = createRenderer(<PinBindingInputGroup {...fakeProps()} />);
    const bindButton = wrapper.root.findByProps({ title: "BIND" });
    expect(bindButton).toBeTruthy();
  });

  it("no pin selected", () => {
    const wrapper = createRenderer(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.root.findAllByType("button");
    const button = buttons[buttons.length - 1];
    expect(button?.props.title).toEqual("BIND");
    actRenderer(() => button?.props.onClick());
    expect(error).toHaveBeenCalledWith("Pin number cannot be blank.");
  });

  it("no target selected", () => {
    const wrapper = createRenderer(<PinBindingInputGroup {...fakeProps()} />);
    const buttons = wrapper.root.findAllByType("button");
    const button = buttons[buttons.length - 1];
    expect(button?.props.title).toEqual("BIND");
    const instance =
      getRendererInstance<PinBindingInputGroup, PinBindingInputGroupProps>(
        wrapper, PinBindingInputGroup);
    actRenderer(() => instance.setState({ pinNumberInput: AVAILABLE_PIN }));
    actRenderer(() => button?.props.onClick());
    expect(error).toHaveBeenCalledWith("Please select a sequence or action.");
  });

  it("registers pin: api", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = createRenderer(<PinBindingInputGroup {...p} />);
    const buttons = wrapper.root.findAllByType("button");
    const button = buttons[buttons.length - 1];
    expect(button?.props.title).toEqual("BIND");
    const instance =
      getRendererInstance<PinBindingInputGroup, PinBindingInputGroupProps>(
        wrapper, PinBindingInputGroup);
    actRenderer(() => instance.setState({ pinNumberInput: 1, sequenceIdInput: 2 }));
    actRenderer(() => button?.props.onClick());
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
    const wrapper = createRenderer(<PinBindingInputGroup {...p} />);
    const buttons = wrapper.root.findAllByType("button");
    const button = buttons[buttons.length - 1];
    expect(button?.props.title).toEqual("BIND");
    const instance =
      getRendererInstance<PinBindingInputGroup, PinBindingInputGroupProps>(
        wrapper, PinBindingInputGroup);
    actRenderer(() => instance.setState({
      pinNumberInput: 0,
      bindingType: PinBindingType.special,
      sequenceIdInput: undefined,
      specialActionInput: PinBindingSpecialAction.emergency_lock
    }));
    actRenderer(() => button?.props.onClick());
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
    const instance = createInstance(p);
    expect(instance.state.sequenceIdInput).toEqual(undefined);
    instance.changeBinding({
      label: "label", value: "" + id,
      headingId: PinBindingType.standard
    });
    expect(instance.state.sequenceIdInput).toEqual(id);
  });

  it("attempts to set pin 99", () => {
    const instance = createInstance();
    expect(instance.state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(99);
    expect(error).toHaveBeenCalledWith(
      "Invalid Raspberry Pi GPIO pin number.");
    expect(warning).not.toHaveBeenCalled();
    expect(instance.state.pinNumberInput).toEqual(undefined);
  });

  it("attempts to set pin 1", () => {
    expect(validGpioPins.length).toBeGreaterThan(0);
    const instance = createInstance();
    expect(instance.state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(1);
    expect(error).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(
      "Reserved Raspberry Pi pin may not work as expected.");
    expect(instance.state.pinNumberInput).toEqual(1);
  });

  it("rejects pin already in use", () => {
    const p = fakeProps();
    const instance = createInstance(p);
    expect(instance.state.pinNumberInput).toEqual(undefined);
    const { pin_number } = p.pinBindings[0];
    instance.setSelectedPin(pin_number);
    expect(error).toHaveBeenCalledWith(
      "Raspberry Pi GPIO pin already bound or in use.");
    expect(warning).not.toHaveBeenCalled();
    expect(instance.state.pinNumberInput).toEqual(undefined);
  });

  it("changes pin number to available pin", () => {
    expect(validGpioPins.length).toBeGreaterThan(0);
    const instance = createInstance();
    expect(instance.state.pinNumberInput).toEqual(undefined);
    instance.setSelectedPin(AVAILABLE_PIN);
    expect(error).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();
    expect(instance.state.pinNumberInput).toEqual(AVAILABLE_PIN);
  });

  it("changes special action", () => {
    const instance = createInstance();
    instance.changeBinding({
      label: "",
      value: PinBindingSpecialAction.sync,
      headingId: PinBindingType.special,
    });
    expect(instance.state.specialActionInput)
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
    const row = PinNumberInputGroup(p) as React.ReactElement<{
      children: React.ReactNode[];
    }>;
    const select = row.props.children[2] as React.ReactElement<FBSelectProps>;
    select.props.onChange({
      label: "", value: AVAILABLE_PIN
    });
    expect(p.setSelectedPin).toHaveBeenCalledWith(AVAILABLE_PIN);
  });
});

describe("<BindingTargetDropdown />", () => {
  let fbSelectSpy: jest.SpyInstance;

  beforeEach(() => {
    fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation((() => <div />) as never);
  });

  afterEach(() => {
    fbSelectSpy.mockRestore();
  });

  const fbSelectProps = () =>
    fbSelectSpy.mock.calls[0][0] as FBSelectProps;

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
    createRenderer(<BindingTargetDropdown {...p} />);
    expect(fbSelectProps().selectedItem).toEqual({
      label: "fake",
      value: 1,
    });
  });

  it("shows action selected", () => {
    const p = fakeProps();
    p.specialActionInput = PinBindingSpecialAction.sync;
    createRenderer(<BindingTargetDropdown {...p} />);
    expect(fbSelectProps().selectedItem).toEqual({
      label: "Sync",
      value: "sync",
    });
  });

  it("shows nothing selected", () => {
    createRenderer(<BindingTargetDropdown {...fakeProps()} />);
    expect(fbSelectProps().selectedItem).toEqual(undefined);
  });

  it("shows sequences", () => {
    const p = fakeProps();
    p.sequenceIdInput = 1;
    createRenderer(<BindingTargetDropdown {...p} />);
    const { list } = fbSelectProps();
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
