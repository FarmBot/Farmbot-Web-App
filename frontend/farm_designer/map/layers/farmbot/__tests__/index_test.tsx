import React from "react";
import { VirtualFarmBot } from "../index";
import { render } from "@testing-library/react";
import { VirtualFarmBotProps } from "../../../interfaces";
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
    const { container } = render(<svg><VirtualFarmBot {...p} /></svg>);
    expect(container.querySelectorAll("#motor-position").length).toEqual(1);
    expect(container.querySelectorAll("#encoder-position").length).toEqual(0);
  });

  it("shows trail", () => {
    const { container } = render(<svg><VirtualFarmBot {...fakeProps()} /></svg>);
    expect(container.querySelectorAll(".virtual-bot-trail").length).toEqual(1);
  });

  it("shows encoder position", () => {
    const { container } = render(<svg><VirtualFarmBot {...fakeProps()} /></svg>);
    expect(container.querySelectorAll("#motor-position").length).toEqual(1);
    expect(container.querySelectorAll("#encoder-position").length).toEqual(1);
  });
});
