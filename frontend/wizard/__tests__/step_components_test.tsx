import React from "react";
import { mount } from "enzyme";
import { FirmwareNumberSettings, Video } from "../step_components";
import { FirmwareNumberSettingsProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeFirmwareConfig } from "../../__test_support__/fake_state/resources";

describe("<Video />", () => {
  it("renders video", () => {
    const wrapper = mount(<Video url={"url"} />);
    expect(wrapper.html()).toContain("url");
  });
});

describe("<FirmwareNumberSettings />", () => {
  const fakeProps = (): FirmwareNumberSettingsProps => {
    const config = fakeFirmwareConfig();
    config.body.movement_step_per_mm_x = 5;
    config.body.movement_axis_nr_steps_x = 500;
    return {
      firmwareNumberSettings: [
        { key: "movement_axis_nr_steps_x", label: "label", scale: "x" },
      ],
      dispatch: jest.fn(),
      bot,
      resources: buildResourceIndex([config]).index,
    };
  };

  it("renders scaled setting", () => {
    const wrapper = mount(<FirmwareNumberSettings {...fakeProps()} />);
    expect(wrapper.find("input").first().props().value).toEqual("100");
  });
});
