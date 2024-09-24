let mockElapsedTime = 0;
jest.mock("@react-three/fiber", () => ({
  Canvas: () => <div />,
  ThreeEvent: jest.fn(),
  useFrame: jest.fn(x => x({
    clock: { getElapsedTime: jest.fn(() => mockElapsedTime) }
  })),
  addEffect: jest.fn(),
}));

const mockSetColor = jest.fn();
jest.mock("react", () => {
  const originReact = jest.requireActual("react");
  const mockRef = jest.fn(() => ({
    current: {
      material: { color: { set: mockSetColor } },
      setOptions: jest.fn(),
    }
  }));
  return {
    ...originReact,
    useRef: mockRef,
  };
});

const lodash = require("lodash");
lodash.debounce = jest.fn(x => x);

jest.mock("../../../devices/actions", () => ({
  execSequence: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { ThreeEvent } from "@react-three/fiber";
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
import { execSequence } from "../../../devices/actions";
import { ButtonPin } from "../list_and_label_support";
import { BoxTopBaseProps } from "../interfaces";

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
      firmwareHardware: "arduino",
    };
  };

  const e = {
    object: {
      parent: {
        children: [
          { name: "button-center", position: { z: 0 }, children: [] },
        ]
      }
    }
  };

  it("triggers binding", () => {
    const p = fakeProps();
    p.isEditing = false;
    p.botOnline = true;
    const wrapper = mount(<Model {...p} />);
    wrapper.find({ name: "action-group" }).first().simulate("pointerdown", e);
    expect(execSequence).toHaveBeenCalledWith(1);
  });

  it("hovers button", () => {
    const wrapper = mount(<Model {...fakeProps()} />);
    const btnBefore = wrapper.find({ name: "button-center" }).first();
    expect(btnBefore.props()["material-color"]).toEqual(13421772);
    wrapper.find({ name: "action-group" }).first().simulate("pointerover", e);
    const btnAfter = wrapper.find({ name: "button-center" }).first();
    expect(btnAfter.props()["material-color"]).toEqual(14540253);
    expect(e.object.parent?.children[0].position.z).toEqual(128);
  });

  it("un-hovers button", () => {
    const wrapper = mount(<Model {...fakeProps()} />);
    wrapper.find({ name: "action-group" }).first().simulate("pointerout", e);
    expect(e.object.parent?.children[0].position.z).toEqual(131);
  });

  it("resets z", () => {
    const wrapper = mount(<Model {...fakeProps()} />);
    wrapper.find({ name: "button-group" }).first().simulate("pointerup", e);
    expect(e.object.parent?.children[0].position.z).toEqual(131);
  });

  it("changes cursor: bound", () => {
    const wrapper = mount(<Model {...fakeProps()} />);
    expect(document.body.style.cursor).toEqual("default");
    wrapper.find({ name: "action-group" }).first().simulate("pointermove");
    expect(document.body.style.cursor).toEqual("pointer");
    document.body.style.cursor = "default";
  });

  it("changes cursor: unbound", () => {
    const wrapper = mount(<Model {...fakeProps()} />);
    expect(document.body.style.cursor).toEqual("default");
    wrapper.find({ name: "action-group" }).last().simulate("pointermove");
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
    mount(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.estop.off);
  });

  it("renders: on", () => {
    const p = fakeProps();
    p.botOnline = true;
    p.bot.hardware.informational_settings.locked = false;
    p.bot.hardware.informational_settings.busy = false;
    mount(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.estop.on);
  });

  it("renders: blinking on", () => {
    mockElapsedTime = 0;
    const p = fakeProps();
    p.isEditing = true;
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    mount(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.unlock.on);
  });

  it("renders: blinking off", () => {
    mockElapsedTime = 1;
    const p = fakeProps();
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    mount(<Model {...p} />);
    expect(mockSetColor).toHaveBeenCalledWith(IColor.unlock.off);
  });

  it("renders: express", () => {
    mockElapsedTime = 1;
    const p = fakeProps();
    p.bot.hardware.informational_settings.locked = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    p.firmwareHardware = "express_k10";
    mount(<Model {...p} />);
    expect(mockSetColor).not.toHaveBeenCalledWith(IColor.unlock.on);
  });
});
