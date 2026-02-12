import React from "react";
import { FarmBotLayer } from "../farmbot_layer";
import { render } from "@testing-library/react";
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
    const { container } = render(<svg><FarmBotLayer {...p} /></svg>);
    const layer = container.querySelector("#farmbot-layer");
    if (!layer) { throw new Error("Missing farmbot layer"); }
    expect(layer.querySelector("#virtual-farmbot")).toBeTruthy();
    expect(layer.querySelector("#extents")).toBeTruthy();
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = render(<svg><FarmBotLayer {...p} /></svg>);
    const layer = container.querySelector("#farmbot-layer");
    if (!layer) { throw new Error("Missing farmbot layer"); }
    expect(layer.children.length).toEqual(0);
  });
});
