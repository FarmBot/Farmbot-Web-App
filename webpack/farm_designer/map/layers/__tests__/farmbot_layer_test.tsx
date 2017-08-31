import * as React from "react";
import { FarmBotLayer, FarmBotLayerProps } from "../farmbot_layer";
import { shallow } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<FarmBotLayer/>", () => {
  function fakeProps(): FarmBotLayerProps {
    return {
      visible: true,
      botPosition: { x: 0, y: 0, z: 0 },
      botOriginQuadrant: 2,
      botMcuParams: bot.hardware.mcu_params,
      stepsPerMmXY: { x: undefined, y: undefined }
    };
  }
  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const result = shallow(<FarmBotLayer {...p } />);
    expect(result.html()).toEqual("<g></g>");
  });
});
