jest.mock("../../session", () => {
  return {
    Session: {
      deprecatedGetBool: jest.fn(),
      invertBool: jest.fn()
    }
  };
});

jest.mock("../../config_storage/actions", () => {
  return {
    toggleWebAppBool: jest.fn()
  };
});

import * as React from "react";
import { mount } from "enzyme";
import { Move } from "../move";
import { bot } from "../../__test_support__/fake_state/bot";
import { MoveProps } from "../interfaces";
import { Session } from "../../session";
import { toggleWebAppBool } from "../../config_storage/actions";

describe("<Move />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): MoveProps {
    return {
      dispatch: jest.fn(),
      bot: bot,
      user: undefined,
      disabled: false,
      raw_encoders: false,
      scaled_encoders: false,
      x_axis_inverted: false,
      y_axis_inverted: false,
      z_axis_inverted: false,
      botToMqttStatus: "up",
      firmwareSettings: bot.hardware.mcu_params,
      xySwap: false,
    };
  }

  it("has default elements", () => {
    const wrapper = mount(<Move {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["move amount (mm)", "110100100010000", "x axisy axisz axis", "motor", "go"]
      .map(string => expect(txt).toContain(string));
  });

  it("has only raw encoder data display", () => {
    const p = fakeProps();
    p.raw_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).not.toContain("scaled");
  });

  it("has both encoder data displays", () => {
    const p = fakeProps();
    p.raw_encoders = true;
    p.scaled_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).toContain("scaled");
  });

  it("toggle: invert jog button", () => {
    const wrapper = mount(<Move {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.toggle("x")();
    expect(Session.invertBool).toHaveBeenCalledWith("x_axis_inverted");
  });

  it("toggle: encoder data display", () => {
    const wrapper = mount(<Move {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.toggle_encoder_data("raw_encoders")();
    expect(Session.invertBool).toHaveBeenCalledWith("raw_encoders");
  });

  it("toggle: xy swap", () => {
    const wrapper = mount(<Move {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.toggle_xy_swap();
    expect(toggleWebAppBool).toHaveBeenCalledWith("xy_swap");
  });
});
