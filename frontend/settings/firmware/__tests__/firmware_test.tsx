const mockDevice = {
  rebootFirmware: jest.fn(() => Promise.resolve()),
  flashFirmware: jest.fn((_) => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import { Firmware } from "../firmware";
import { FirmwareProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeTimeSettings,
} from "../../../__test_support__/fake_time_settings";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<Firmware />", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): FirmwareProps => ({
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
    bot: bot,
    alerts: [],
    timeSettings: fakeTimeSettings(),
  });

  it("restarts firmware", () => {
    const p = fakeProps();
    p.bot.controlPanelState.firmware = true;
    const wrapper = mount(<Firmware {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Restart Firmware".toLowerCase());
    clickButton(wrapper, 2, "restart");
    expect(mockDevice.rebootFirmware).toHaveBeenCalled();
  });

  it("flashes firmware", () => {
    const p = fakeProps();
    p.bot.controlPanelState.firmware = true;
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const wrapper = mount(<Firmware {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Flash Firmware".toLowerCase());
    clickButton(wrapper, 0, "flash firmware");
    expect(mockDevice.flashFirmware).toHaveBeenCalledWith("arduino");
  });
});
