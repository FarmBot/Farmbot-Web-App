const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../../session", () => {
  return {
    Session: {
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import * as React from "react";
import { shallow } from "enzyme";
import { BotPeripheralsProps, BotPeripherals } from "../bot_peripherals";
import { BooleanSetting } from "../../../../session_keys";
import { fakeMapTransformProps } from "../../../../__test_support__/map_transform_props";

describe("<BotPeripherals/>", () => {
  function fakeProps(): BotPeripheralsProps {
    return {
      peripherals: [{ label: "", value: false }],
      position: { x: 0, y: 0, z: 0 },
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  function notDisplayed(name: string) {
    it(`doesn't display ${name}`, () => {
      const p = fakeProps();
      p.peripherals[0].label = name;
      p.peripherals[0].value = false;
      const wrapper = shallow(<BotPeripherals {...p} />);
      expect(wrapper.find(`#${name}`).length).toEqual(0);
    });
  }

  function animationToggle(
    props: BotPeripheralsProps, enabled: number, disabled: number) {
    mockStorj[BooleanSetting.disable_animations] = false;
    const wrapperEnabled = shallow(<BotPeripherals {...props} />);
    expect(wrapperEnabled.find("use").length).toEqual(enabled);

    mockStorj[BooleanSetting.disable_animations] = true;
    const wrapperDisabled = shallow(<BotPeripherals {...props} />);
    expect(wrapperDisabled.find("use").length).toEqual(disabled);
  }

  it("displays light", () => {
    const p = fakeProps();
    p.peripherals[0].label = "lights";
    p.peripherals[0].value = true;
    const wrapper = shallow(<BotPeripherals {...p} />);
    expect(wrapper.find("#lights").length).toEqual(1);
    expect(wrapper.find("rect").last().props()).toEqual({
      fill: "url(#LightingGradient)",
      height: 1700, width: 400, x: 0, y: -100
    });
  });

  it("displays water", () => {
    const p = fakeProps();
    p.peripherals[0].label = "water valve";
    p.peripherals[0].value = true;
    const wrapper = shallow(<BotPeripherals {...p} />);
    expect(wrapper.find("#water").length).toEqual(1);
    expect(wrapper.find("circle").last().props()).toEqual({
      cx: 0, cy: 0, fill: "rgb(11, 83, 148)", fillOpacity: 0.2, r: 55
    });
    animationToggle(p, 75, 25);
  });

  it("displays vacuum", () => {
    const p = fakeProps();
    p.peripherals[0].label = "vacuum pump";
    p.peripherals[0].value = true;
    const wrapper = shallow(<BotPeripherals {...p} />);
    expect(wrapper.find("#vacuum").length).toEqual(1);
    expect(wrapper.find("circle").last().props()).toEqual({
      fill: "url(#WaveGradient)", cx: 0, cy: 0, r: 100
    });
    animationToggle(p, 3, 1);
  });

  notDisplayed("lights");
  notDisplayed("vacuum");
  notDisplayed("water");
});
