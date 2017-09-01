import * as React from "react";
import { BotExtents, BotExtentsProps } from "../bot_extents";
import { shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<VirtualFarmBot/>", () => {
  function fakeProps(): BotExtentsProps {
    const mcuParams = bot.hardware.mcu_params;
    mcuParams.movement_axis_nr_steps_x = 0;
    mcuParams.movement_axis_nr_steps_y = 0;
    mcuParams.movement_stop_at_home_x = 1;
    mcuParams.movement_stop_at_home_y = 1;
    mcuParams.movement_stop_at_max_x = 1;
    mcuParams.movement_stop_at_max_y = 1;
    return {
      quadrant: 2,
      botMcuParams: mcuParams,
      stepsPerMmXY: { x: 5, y: 5 }
    };
  }

  it("renders home lines", () => {
    const p = fakeProps();
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).props()).toEqual({ "x1": 2, "x2": 2, "y1": 2, "y2": 1500 });
    expect(homeLines.at(1).props()).toEqual({ "x1": 2, "x2": 3000, "y1": 2, "y2": 2 });
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).html()).toBeFalsy();
    expect(maxLines.at(1).html()).toBeFalsy();
  });

  it("still renders full home lines", () => {
    const p = fakeProps();
    p.botMcuParams.movement_stop_at_max_x = 0;
    p.botMcuParams.movement_stop_at_max_y = 0;
    p.botMcuParams.movement_axis_nr_steps_x = 500;
    p.botMcuParams.movement_axis_nr_steps_y = 500;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).props()).toEqual({ "x1": 2, "x2": 2, "y1": 2, "y2": 1500 });
    expect(homeLines.at(1).props()).toEqual({ "x1": 2, "x2": 3000, "y1": 2, "y2": 2 });
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).html()).toBeFalsy();
    expect(maxLines.at(1).html()).toBeFalsy();
  });

  it("renders home and max lines", () => {
    const p = fakeProps();
    p.botMcuParams.movement_axis_nr_steps_x = 500;
    p.botMcuParams.movement_axis_nr_steps_y = 500;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).props()).toEqual({ "x1": 2, "x2": 2, "y1": 2, "y2": 100 });
    expect(homeLines.at(1).props()).toEqual({ "x1": 2, "x2": 100, "y1": 2, "y2": 2 });
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).props()).toEqual({ "x1": 100, "x2": 100, "y1": 2, "y2": 100 });
    expect(maxLines.at(1).props()).toEqual({ "x1": 2, "x2": 100, "y1": 100, "y2": 100 });
  });

  it("renders home and max lines for one axis only", () => {
    const p = fakeProps();
    p.botMcuParams.movement_stop_at_max_x = 0;
    p.botMcuParams.movement_stop_at_home_x = 0;
    p.botMcuParams.movement_axis_nr_steps_x = 500;
    p.botMcuParams.movement_axis_nr_steps_y = 500;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).props()).toEqual({ "x1": 2, "x2": 3000, "y1": 2, "y2": 2 });
    expect(homeLines.at(1).html()).toBeFalsy();
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).props()).toEqual({ "x1": 2, "x2": 3000, "y1": 100, "y2": 100 });
    expect(maxLines.at(1).html()).toBeFalsy();
  });

  it("renders max lines", () => {
    const p = fakeProps();
    p.botMcuParams.movement_stop_at_home_x = 0;
    p.botMcuParams.movement_stop_at_home_y = 0;
    p.botMcuParams.movement_axis_nr_steps_x = 500;
    p.botMcuParams.movement_axis_nr_steps_y = 500;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).html()).toBeFalsy();
    expect(homeLines.at(1).html()).toBeFalsy();
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).props()).toEqual({ "x1": 100, "x2": 100, "y1": 2, "y2": 100 });
    expect(maxLines.at(1).props()).toEqual({ "x1": 2, "x2": 100, "y1": 100, "y2": 100 });
  });

  it("renders home and max lines in correct location for quadrant 1", () => {
    const p = fakeProps();
    p.quadrant = 1;
    p.botMcuParams.movement_axis_nr_steps_x = 500;
    p.botMcuParams.movement_axis_nr_steps_y = 500;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).props()).toEqual({ "x1": 2998, "x2": 2998, "y1": 2, "y2": 100 });
    expect(homeLines.at(1).props()).toEqual({ "x1": 2998, "x2": 2900, "y1": 2, "y2": 2 });
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).props()).toEqual({ "x1": 2900, "x2": 2900, "y1": 2, "y2": 100 });
    expect(maxLines.at(1).props()).toEqual({ "x1": 2998, "x2": 2900, "y1": 100, "y2": 100 });
  });

  it("renders no lines", () => {
    const p = fakeProps();
    p.botMcuParams.movement_stop_at_home_x = 0;
    p.botMcuParams.movement_stop_at_home_y = 0;
    p.botMcuParams.movement_stop_at_max_x = 0;
    p.botMcuParams.movement_stop_at_max_y = 0;
    const wrapper = shallow(<BotExtents {...p } />);
    const homeLines = wrapper.find("#home-lines").find("line");
    expect(homeLines.at(0).html()).toBeFalsy();
    expect(homeLines.at(1).html()).toBeFalsy();
    const maxLines = wrapper.find("#max-lines").find("line");
    expect(maxLines.at(0).html()).toBeFalsy();
    expect(maxLines.at(1).html()).toBeFalsy();
  });

});
