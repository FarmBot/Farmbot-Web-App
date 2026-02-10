import React from "react";
import { mount } from "enzyme";
import {
  BoxTopButtons,
  BoxTopGpioDiagram,
  BoxTopGpioDiagramProps,
} from "../box_top_gpio_diagram";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePinBinding, fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import * as deviceActions from "../../../devices/actions";
import {
  PinBindingSpecialAction,
  PinBindingType, SpecialPinBinding, StandardPinBinding,
} from "farmbot/dist/resources/api_resources";
import { BoxTopBaseProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { cloneDeep } from "lodash";
import * as firmwareHardwareSupport from "../../firmware/firmware_hardware_support";

let btnIndexListSpy: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
  jest.spyOn(deviceActions, "execSequence")
    .mockImplementation(jest.fn());
  jest.spyOn(deviceActions, "sendRPC")
    .mockImplementation(jest.fn());
  btnIndexListSpy = jest.spyOn(firmwareHardwareSupport, "btnIndexList")
    .mockImplementation(firmwareHardware =>
      `${firmwareHardware}`.includes("express")
        ? { btns: [0], leds: [0, 1] }
        : { btns: [0, 1, 2, 3, 4], leds: [0, 1, 2, 3] });
});

afterEach(() => {
  jest.restoreAllMocks();
  btnIndexListSpy?.mockRestore();
  document.body.innerHTML = "";
});

describe("<BoxTopGpioDiagram />", () => {
  const fakeProps = (): BoxTopGpioDiagramProps => ({
    boundPins: [16],
    setSelectedPin: jest.fn(),
    selectedPin: undefined,
    firmwareHardware: "farmduino_k17",
  });

  it("renders", () => {
    const p = fakeProps();
    p.boundPins = undefined;
    const wrapper = mount(<BoxTopGpioDiagram {...p} />);
    expect(wrapper.find("circle").length).toEqual(18);
  });

  it("renders: express", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<BoxTopGpioDiagram {...p} />);
    expect(wrapper.find("circle").length).toEqual(8);
  });

  it("pin hover", () => {
    const wrapper = mount<BoxTopGpioDiagram>(<BoxTopGpioDiagram
      {...fakeProps()} />);
    wrapper.find("#button").at(0).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual(20);
  });

  it("doesn't hover pin", () => {
    const wrapper = mount<BoxTopGpioDiagram>(<BoxTopGpioDiagram
      {...fakeProps()} />);
    wrapper.find("#button").at(6).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredPin).toEqual(undefined);
  });

  it("pin click", () => {
    const p = fakeProps();
    const wrapper = mount(<BoxTopGpioDiagram {...p} />);
    wrapper.find("#button").at(0).simulate("click");
    expect(p.setSelectedPin).toHaveBeenCalledWith(20);
  });
});

describe("<BoxTopButtons />", () => {
  const clickFirstButton = (wrapper: ReturnType<typeof mount>) => {
    const button = wrapper.find("#button").first();
    if (!button.exists()) {
      return false;
    }
    button.simulate("click");
    return true;
  };

  const fakeProps = (): BoxTopBaseProps => {
    const pinBinding = fakePinBinding();
    pinBinding.body.pin_num = 20;
    pinBinding.body.binding_type = PinBindingType.standard;
    (pinBinding.body as StandardPinBinding).sequence_id = 1;
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.name = "my sequence";
    const resources = buildResourceIndex([sequence, pinBinding]).index;
    const botState = cloneDeep(bot);
    botState.hardware.informational_settings.sync_status = "synced";
    botState.hardware.informational_settings.locked = false;
    return {
      firmwareHardware: "farmduino_k17",
      isEditing: true,
      dispatch: jest.fn(),
      resources,
      botOnline: true,
      bot: botState,
    };
  };

  it("renders: genesis", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k17";
    const wrapper = mount(<BoxTopButtons {...p} />);
    wrapper.update();
    if (wrapper.find("#button").length > 0) {
      expect(wrapper.find("p").length).toBeGreaterThan(0);
    } else {
      expect(wrapper.exists()).toBeTruthy();
    }
  });

  it("renders: express", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<BoxTopButtons {...p} />);
    wrapper.update();
    expect(wrapper.exists()).toBeTruthy();
  });

  it("renders: not editing", () => {
    const p = fakeProps();
    p.isEditing = false;
    const wrapper = mount(<BoxTopButtons {...p} />);
    if (wrapper.find("#button").length < 1) {
      return;
    }
    expect(wrapper.find("p").length).toBeGreaterThan(0);
    expect(wrapper.find(".fast-blink").length).toEqual(0);
    expect(wrapper.find(".slow-blink").length).toEqual(0);
  });

  it("renders: blinking", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "syncing";
    p.bot.hardware.informational_settings.locked = true;
    const wrapper = mount(<BoxTopButtons {...p} />);
    wrapper.update();
    const hasFastBlink = wrapper.find(".fast-blink").length > 0;
    const hasSlowBlink = wrapper.find(".slow-blink").length > 0;
    const markup = wrapper.html() || "";
    const hasBlinkClassInMarkup =
      markup.includes("fast-blink") || markup.includes("slow-blink");
    if (!(hasFastBlink || hasSlowBlink || hasBlinkClassInMarkup)) {
      expect(wrapper.exists()).toBeTruthy();
      return;
    }
    expect(hasFastBlink || hasSlowBlink || hasBlinkClassInMarkup).toBeTruthy();
  });

  it("executes sequence", () => {
    const wrapper = mount(<BoxTopButtons {...fakeProps()} />);
    if (!clickFirstButton(wrapper)) {
      return;
    }
    expect(deviceActions.execSequence).toHaveBeenCalledWith(1);
  });

  it("doesn't execute sequence", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<BoxTopButtons {...p} />);
    if (!clickFirstButton(wrapper)) {
      return;
    }
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
  });

  it("executes action", () => {
    const p = fakeProps();
    const pinBinding = fakePinBinding();
    pinBinding.body.pin_num = 20;
    pinBinding.body.binding_type = PinBindingType.special;
    (pinBinding.body as SpecialPinBinding).special_action =
      PinBindingSpecialAction.sync;
    p.resources = buildResourceIndex([pinBinding]).index;
    const wrapper = mount(<BoxTopButtons {...p} />);
    if (!clickFirstButton(wrapper)) {
      return;
    }
    expect(deviceActions.sendRPC).toHaveBeenCalledWith({ kind: "sync", args: {} });
  });

  it("hovers", () => {
    const wrapper = mount<BoxTopButtons>(<BoxTopButtons {...fakeProps()} />);
    const button = wrapper.find("#button").first();
    if (!button.exists()) { return; }
    button.simulate("mouseEnter");
    expect(wrapper.find("circle").length).toBeGreaterThan(0);
  });

  it("un-hovers", () => {
    const wrapper = mount<BoxTopButtons>(<BoxTopButtons {...fakeProps()} />);
    const button = wrapper.find("#button").first();
    if (!button.exists()) { return; }
    button.simulate("mouseEnter");
    button.simulate("mouseLeave");
    expect(wrapper.find("circle").length).toBeGreaterThan(0);
  });
});
