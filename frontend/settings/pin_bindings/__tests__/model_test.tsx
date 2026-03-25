let mockElapsedTime = 0;

jest.mock("lodash", () => {
  const actual = jest.requireActual("lodash");
  return {
    ...actual,
    debounce: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  };
});

const mockSetColor = jest.fn();

import React, * as ReactModule from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as threeFiber from "@react-three/fiber";
import {
  actRenderer,
  createRenderer,
} from "../../../__test_support__/test_renderer";
import { IColor, Model, setZForAllInGroup } from "../model";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  StandardPinBinding,
} from "farmbot/dist/resources/api_resources";
import {
  fakePinBinding, fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import { bot } from "../../../__test_support__/fake_state/bot";
import * as deviceActions from "../../../devices/actions";
import { ButtonPin } from "../list_and_label_support";
import { BoxTopBaseProps } from "../interfaces";
import { FirmwareHardware } from "farmbot";

describe("setZForAllInGroup()", () => {
  it("sets z", () => {
    const e = {
      object: {
        parent: {
          children: [
            { name: "button-center", position: { z: 0 }, children: [] },
          ]
        }
      }
    } as unknown as ThreeEvent<PointerEvent>;
    setZForAllInGroup(e, 100);
    expect(e.object.parent?.children[0].position.z).toEqual(100);
  });
});

describe("<ElectronicsBoxModel />", () => {
  let execSequenceSpy: jest.SpyInstance;
  let useFrameSpy: jest.SpyInstance;
  let reactUseRefSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.style.cursor = "default";
    reactUseRefSpy = jest.spyOn(ReactModule, "useRef")
      .mockImplementation(() => ({
        current: {
          material: { color: { set: mockSetColor } },
          setOptions: jest.fn(),
        }
      }) as never);
    useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(((callback, _renderPriority) => {
        callback({
          clock: { getElapsedTime: jest.fn(() => mockElapsedTime) }
        } as never, 0, undefined as never);
        // eslint-disable-next-line no-null/no-null
        return null;
      }) as typeof threeFiber.useFrame);
    execSequenceSpy = jest.spyOn(deviceActions, "execSequence")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.style.cursor = "default";
    reactUseRefSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  const fakeProps = (): BoxTopBaseProps => {
    const binding = fakePinBinding();
    binding.body.pin_num = ButtonPin.estop;
    (binding.body as StandardPinBinding).sequence_id = 1;
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.name = "e-stop";
    return {
      isEditing: false,
      dispatch: jest.fn(),
      resources: buildResourceIndex([binding, sequence]).index,
      botOnline: true,
      bot,
      firmwareHardware: "farmduino_k17",
    };
  };

  const fakeEvent = () => ({
    object: {
      parent: {
        children: [
          { name: "button-center", position: { z: 0 }, children: [] },
        ]
      }
    }
  });

  it("triggers binding", () => {
    const e = fakeEvent();
    const p = fakeProps();
    p.isEditing = false;
    p.botOnline = true;
    const wrapper = createRenderer(<Model {...p} />);
    const actionGroups = wrapper.root.findAll(node => node.props.name == "action-group");
    actRenderer(() => {
      actionGroups[0]?.props.onPointerDown(e);
    });
    jest.runOnlyPendingTimers();
    expect(execSequenceSpy).toHaveBeenCalledWith(1);
  });

  it("hovers button", () => {
    const e = fakeEvent();
    const wrapper = createRenderer(<Model {...fakeProps()} />);
    const btnBefore = wrapper.root.findAll(node => node.props.name == "button-center")[0];
    expect(btnBefore?.props["material-color"]).toEqual(13421772);
    const actionGroups = wrapper.root.findAll(node => node.props.name == "action-group");
    actRenderer(() => {
      actionGroups[0]?.props.onPointerOver(e);
    });
    const btnAfter = wrapper.root.findAll(node => node.props.name == "button-center")[0];
    expect(btnAfter?.props["material-color"]).toEqual(14540253);
    expect(e.object.parent?.children[0].position.z).toEqual(0);
  });

  it("un-hovers button", () => {
    const e = fakeEvent();
    const wrapper = createRenderer(<Model {...fakeProps()} />);
    const actionGroups = wrapper.root.findAll(node => node.props.name == "action-group");
    actRenderer(() => {
      actionGroups[0]?.props.onPointerOut(e);
    });
    expect(e.object.parent?.children[0].position.z).toEqual(131);
  });

  it("resets z", () => {
    const e = fakeEvent();
    const wrapper = createRenderer(<Model {...fakeProps()} />);
    const buttonGroups = wrapper.root.findAll(node => node.props.name == "button-group");
    actRenderer(() => {
      buttonGroups[0]?.props.onPointerUp(e);
    });
    expect(e.object.parent?.children[0].position.z).toEqual(131);
  });

  it("changes cursor: bound", () => {
    const wrapper = createRenderer(<Model {...fakeProps()} />);
    expect(document.body.style.cursor).toEqual("default");
    const actionGroups = wrapper.root.findAll(node => node.props.name == "action-group");
    actRenderer(() => {
      actionGroups[0]?.props.onPointerMove();
    });
    expect(document.body.style.cursor).toEqual("pointer");
    document.body.style.cursor = "default";
  });

  it("changes cursor: unbound", () => {
    const wrapper = createRenderer(<Model {...fakeProps()} />);
    expect(document.body.style.cursor).toEqual("default");
    const actionGroups = wrapper.root.findAll(node => node.props.name == "action-group");
    actRenderer(() => {
      actionGroups[actionGroups.length - 1]?.props.onPointerMove();
    });
    expect(document.body.style.cursor).toEqual("not-allowed");
    document.body.style.cursor = "default";
  });

  it("renders: off", () => {
    const p = fakeProps();
    p.isEditing = true;
    p.botOnline = false;
    p.bot.hardware.informational_settings.locked = false;
    p.bot.hardware.informational_settings.sync_status = "booting";
    const sequence = fakeSequence();
    p.resources = buildResourceIndex([sequence]).index;
    createRenderer(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.estop.off);
  });

  it("renders: on", () => {
    const p = fakeProps();
    p.botOnline = true;
    p.bot.hardware.informational_settings.locked = false;
    p.bot.hardware.informational_settings.busy = false;
    createRenderer(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.estop.on);
  });

  it("renders: blinking on", () => {
    mockElapsedTime = 0;
    const p = fakeProps();
    p.isEditing = true;
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    createRenderer(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.unlock.on);
  });

  it("renders: blinking off", () => {
    mockElapsedTime = 1;
    const p = fakeProps();
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    createRenderer(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.unlock.off);
  });

  it("renders: express", () => {
    mockElapsedTime = 1;
    const p = fakeProps();
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    p.firmwareHardware = "express_k10";
    createRenderer(<Model {...p} />);
    expect(mockSetColor).not.toHaveBeenCalledWith(IColor.unlock.on);
  });

  it.each<[FirmwareHardware, number]>([
    ["express_k11", 1],
    ["farmduino_k17", 5],
    ["farmduino_k18", 3],
  ])("renders: %s", (firmwareHardware, count) => {
    const p = fakeProps();
    p.firmwareHardware = firmwareHardware;
    const wrapper = createRenderer(<Model {...p} />);
    const buttons = wrapper.root.findAll(node => node.props.name == "button-center");
    expect(buttons.length).toEqual(count * 2);
  });
});
