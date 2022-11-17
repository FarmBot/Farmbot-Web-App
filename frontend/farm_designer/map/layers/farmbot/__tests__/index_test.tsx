import React from "react";
import { VirtualFarmBot } from "../index";
import { shallow } from "enzyme";
import { VirtualFarmBotProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { BotFigure } from "../bot_figure";
import {
  fakeMountedToolInfo,
} from "../../../../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../../../../__test_support__/fake_camera_data";
import {
  fakeBotLocationData,
} from "../../../../../__test_support__/fake_bot_data";

describe("<VirtualFarmBot/>", () => {
  const fakeProps = (): VirtualFarmBotProps => ({
    botLocationData: fakeBotLocationData(),
    mapTransformProps: fakeMapTransformProps(),
    plantAreaOffset: { x: 100, y: 100 },
    peripheralValues: [],
    eStopStatus: false,
    getConfigValue: () => true,
    mountedToolInfo: fakeMountedToolInfo(),
    cameraCalibrationData: fakeCameraCalibrationData(),
  });

  it("shows bot position", () => {
    const p = fakeProps();
    p.getConfigValue = () => false;
    const wrapper = shallow(<VirtualFarmBot {...p} />);
    const figures = wrapper.find(BotFigure);
    expect(figures.length).toEqual(1);
    expect(figures.last().props().figureName).toEqual("motor-position");
  });

  it("shows trail", () => {
    const wrapper = shallow(<VirtualFarmBot {...fakeProps()} />);
    expect(wrapper.find("BotTrail").length).toEqual(1);
  });

  it("shows encoder position", () => {
    const wrapper = shallow(<VirtualFarmBot {...fakeProps()} />);
    const figures = wrapper.find(BotFigure);
    expect(figures.length).toEqual(2);
    expect(figures.last().props().figureName).toEqual("encoder-position");
  });
});
