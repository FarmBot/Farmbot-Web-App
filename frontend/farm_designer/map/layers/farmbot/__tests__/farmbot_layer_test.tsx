import React from "react";
import { FarmBotLayer } from "../farmbot_layer";
import { shallow } from "enzyme";
import { FarmBotLayerProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeMountedToolInfo,
} from "../../../../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../../../../__test_support__/fake_camera_data";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../../__test_support__/fake_bot_data";

describe("<FarmBotLayer/>", () => {
  const fakeProps = (): FarmBotLayerProps => ({
    visible: true,
    botLocationData: fakeBotLocationData(),
    mapTransformProps: fakeMapTransformProps(),
    stopAtHome: { x: true, y: true },
    botSize: fakeBotSize(),
    plantAreaOffset: { x: 100, y: 100 },
    peripheralValues: [],
    eStopStatus: false,
    getConfigValue: jest.fn(),
    mountedToolInfo: fakeMountedToolInfo(),
    cameraCalibrationData: fakeCameraCalibrationData(),
  });

  it("shows layer elements", () => {
    const p = fakeProps();
    const result = shallow(<FarmBotLayer {...p} />);
    const layer = result.find("#farmbot-layer");
    expect(layer.find("#virtual-farmbot")).toBeTruthy();
    expect(layer.find("#extents")).toBeTruthy();
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const result = shallow(<FarmBotLayer {...p} />);
    expect(result.html()).toEqual("<g id=\"farmbot-layer\"></g>");
  });
});
