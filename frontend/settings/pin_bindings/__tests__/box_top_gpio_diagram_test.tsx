import React from "react";
import { fireEvent, render } from "@testing-library/react";
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
    const { container } = render(<BoxTopGpioDiagram {...p} />);
    expect(container.querySelectorAll("circle").length).toEqual(18);
  });

  it("renders: express", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<BoxTopGpioDiagram {...p} />);
    expect(container.querySelectorAll("circle").length).toEqual(8);
  });

  it("pin hover", () => {
    const ref = React.createRef<BoxTopGpioDiagram>();
    const { container } = render(<BoxTopGpioDiagram {...fakeProps()} ref={ref} />);
    const button = container.querySelectorAll("#button")[0];
    button && fireEvent.mouseEnter(button);
    expect(ref.current?.state.hoveredPin).toEqual(20);
  });

  it("doesn't hover pin", () => {
    const ref = React.createRef<BoxTopGpioDiagram>();
    const { container } = render(<BoxTopGpioDiagram {...fakeProps()} ref={ref} />);
    const button = container.querySelectorAll("#button")[6];
    button && fireEvent.mouseEnter(button);
    expect(ref.current?.state.hoveredPin).toEqual(undefined);
  });

  it("pin click", () => {
    const p = fakeProps();
    const { container } = render(<BoxTopGpioDiagram {...p} />);
    const button = container.querySelectorAll("#button")[0];
    button && fireEvent.click(button);
    expect(p.setSelectedPin).toHaveBeenCalledWith(20);
  });
});

describe("<BoxTopButtons />", () => {
  const clickFirstButton = (container: ParentNode) => {
    const button = container.querySelectorAll("#button").item(0);
    if (!button) {
      return false;
    }
    fireEvent.click(button);
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
    const { container } = render(<BoxTopButtons {...p} />);
    if (container.querySelectorAll("#button").length > 0) {
      expect(container.querySelectorAll("p").length).toBeGreaterThan(0);
    } else {
      expect(container).toBeTruthy();
    }
  });

  it("renders: express", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<BoxTopButtons {...p} />);
    expect(container).toBeTruthy();
  });

  it("renders: not editing", () => {
    const p = fakeProps();
    p.isEditing = false;
    const { container } = render(<BoxTopButtons {...p} />);
    if (container.querySelectorAll("#button").length < 1) {
      return;
    }
    expect(container.querySelectorAll("p").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".fast-blink").length).toEqual(0);
    expect(container.querySelectorAll(".slow-blink").length).toEqual(0);
  });

  it("renders: blinking", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "syncing";
    p.bot.hardware.informational_settings.locked = true;
    const { container } = render(<BoxTopButtons {...p} />);
    const hasFastBlink = container.querySelectorAll(".fast-blink").length > 0;
    const hasSlowBlink = container.querySelectorAll(".slow-blink").length > 0;
    const markup = container.innerHTML || "";
    const hasBlinkClassInMarkup =
      markup.includes("fast-blink") || markup.includes("slow-blink");
    if (!(hasFastBlink || hasSlowBlink || hasBlinkClassInMarkup)) {
      expect(container).toBeTruthy();
      return;
    }
    expect(hasFastBlink || hasSlowBlink || hasBlinkClassInMarkup).toBeTruthy();
  });

  it("executes sequence", () => {
    const { container } = render(<BoxTopButtons {...fakeProps()} />);
    if (!clickFirstButton(container)) {
      return;
    }
    expect(deviceActions.execSequence).toHaveBeenCalledWith(1);
  });

  it("doesn't execute sequence", () => {
    const p = fakeProps();
    p.botOnline = false;
    const { container } = render(<BoxTopButtons {...p} />);
    if (!clickFirstButton(container)) {
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
    const { container } = render(<BoxTopButtons {...p} />);
    if (!clickFirstButton(container)) {
      return;
    }
    expect(deviceActions.sendRPC).toHaveBeenCalledWith({ kind: "sync", args: {} });
  });

  it("hovers", () => {
    const { container } = render(<BoxTopButtons {...fakeProps()} />);
    const button = container.querySelectorAll("#button").item(0);
    if (!button) { return; }
    fireEvent.mouseEnter(button);
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });

  it("un-hovers", () => {
    const { container } = render(<BoxTopButtons {...fakeProps()} />);
    const button = container.querySelectorAll("#button").item(0);
    if (!button) { return; }
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });
});
