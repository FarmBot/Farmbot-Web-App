jest.mock("../../session", () => {
  return {
    Session: {
      deprecatedGetBool: jest.fn(),
      invertBool: jest.fn()
    }
  };
});

import * as React from "react";
import { mount } from "enzyme";
import { Move } from "../move";
import { bot } from "../../__test_support__/fake_state/bot";
import { MoveProps } from "../interfaces";
import { Actions } from "../../constants";
import { Session } from "../../session";

describe("<Move />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): MoveProps {
    return {
      dispatch: jest.fn(),
      bot: bot,
      user: undefined,
      disabled: false
    };
  }

  it("has default elements", () => {
    const wrapper = mount(<Move {...fakeProps() } />);
    const txt = wrapper.text().toLowerCase();
    ["move amount (mm)", "110100100010000", "x axisy axisz axis", "motor", "go"]
      .map(string => expect(txt).toContain(string));
  });

  it("has only raw encoder data display", () => {
    const p = fakeProps();
    p.bot.encoder_visibility.raw_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).not.toContain("scaled");
  });

  it("has both encoder data displays", () => {
    const p = fakeProps();
    p.bot.encoder_visibility.raw_encoders = true;
    p.bot.encoder_visibility.scaled_encoders = true;
    const wrapper = mount(<Move {...p} />);
    const txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).toContain("scaled");
  });

  it("toggle: invert jog button", () => {
    const p = fakeProps();
    const wrapper = mount(<Move {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.toggle("x")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.INVERT_JOG_BUTTON,
      payload: "x"
    });
    expect(Session.invertBool).toHaveBeenCalledWith("x_axis_inverted");
  });

  it("toggle: encoder data display", () => {
    const p = fakeProps();
    const wrapper = mount(<Move {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.toggle_encoder_data("raw_encoders")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.DISPLAY_ENCODER_DATA,
      payload: "raw_encoders"
    });
    expect(Session.invertBool).toHaveBeenCalledWith("raw_encoders");
  });
});
