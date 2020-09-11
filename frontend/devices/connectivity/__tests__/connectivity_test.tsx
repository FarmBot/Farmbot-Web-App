jest.mock("../../../api/crud", () => ({ refresh: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import { Connectivity, ConnectivityProps, formatMac } from "../connectivity";
import { bot } from "../../../__test_support__/fake_state/bot";
import { StatusRowProps } from "../connectivity_row";
import { fill } from "lodash";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { refresh } from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<Connectivity />", () => {
  const statusRow = {
    connectionName: "AB",
    from: "A",
    to: "B",
    connectionStatus: false,
    children: "Can't do things with stuff."
  };
  const rowData: StatusRowProps[] = fill(Array(5), statusRow);
  const flags = {
    userMQTT: false,
    userAPI: false,
    botMQTT: false,
    botAPI: false,
    botFirmware: false,
  };

  const fakeProps = (): ConnectivityProps => ({
    bot,
    rowData,
    flags,
    pings: fakePings(),
    dispatch: jest.fn(),
    device: fakeDevice(),
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
  });

  it("sets hovered connection", () => {
    const wrapper = mount<Connectivity>(<Connectivity {...fakeProps()} />);
    wrapper.find(".saucer").at(6).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredConnection).toEqual("AB");
  });

  it("refreshes device", () => {
    const p = fakeProps();
    mount(<Connectivity {...p} />);
    expect(refresh).toHaveBeenCalledWith(p.device);
  });

  it("displays fbos_version", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = undefined;
    p.device.body.fbos_version = "1.0.0";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("version last seen: v1.0.0");
  });

  it("displays controller version", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("version: v1.0.0");
  });

  it("displays more network info", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.private_ip = "1.0.0.1";
    p.bot.hardware.informational_settings.node_name = "f-12345678";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("1.0.0.1");
    expect(wrapper.text().toLowerCase()).toContain("12:34:56:78");
  });

  it("doesn't display more network info", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.private_ip = undefined;
    p.bot.hardware.informational_settings.node_name = "---";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("ip");
    expect(wrapper.text().toLowerCase()).not.toContain("mac");
  });
});

describe("formatMac()", () => {
  it("returns formatted MAC address", () => {
    expect(formatMac("farmbot-00000000abcdefgh")).toEqual("ab:cd:ef:gh");
    expect(formatMac("farmbot-0000000012345678.local")).toEqual("12:34:56:78");
  });
});
