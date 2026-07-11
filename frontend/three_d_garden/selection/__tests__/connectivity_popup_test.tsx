import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { clone } from "lodash";
import { ConnectivityPopupContent } from "../connectivity_popup";
import { bot as fakeBot } from
  "../../../__test_support__/fake_state/bot";
import { fakeDevice } from
  "../../../__test_support__/resource_index_builder";
import { fakePings } from
  "../../../__test_support__/fake_state/pings";
import { connectivityData } from
  "../../../devices/connectivity/generate_data";

const popupData = (
  bot: typeof fakeBot,
  device = fakeDevice(),
) => connectivityData({ bot, device, apiFirmwareValue: undefined });

describe("<ConnectivityPopupContent />", () => {
  it("renders the connectivity summary and indicators", () => {
    const bot = clone(fakeBot);
    bot.connectivity.pings = fakePings();
    bot.connectivity.uptime["user.api"] = { state: "up", at: Date.now() };
    bot.connectivity.uptime["user.mqtt"] = { state: "up", at: Date.now() };
    bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: Date.now() };
    bot.hardware.informational_settings.wifi_level_percent = 95;
    bot.hardware.informational_settings.private_ip = "192.168.1.2";
    const device = fakeDevice({ last_saw_api: new Date().toISOString() });
    const { container } = render(<ConnectivityPopupContent
      bot={bot}
      data={popupData(bot, device)} />);

    expect(container.querySelector(".connectivity-diagram")).toBeTruthy();
    expect(container).not.toHaveTextContent("FarmBot Connection");
    expect(container.querySelector(".percent-bar-fill.green"))
      .toHaveStyle({ width: "95%" });
    expect(container).toHaveTextContent("Percent OK pings50 %");
    expect(container).toHaveTextContent("Average ping time312 ms");
    expect(container).toHaveTextContent("PortsOK");
    expect(container.querySelectorAll(".saucer.green")).toHaveLength(2);
    const connector = container.querySelector(".connector-hover-area");
    connector && fireEvent.mouseEnter(connector);
  });

  it("shows failed ports and unavailable ping measurements", () => {
    const bot = clone(fakeBot);
    const { container } = render(<ConnectivityPopupContent
      bot={bot}
      data={popupData(bot)} />);
    expect(container).toHaveTextContent("Percent OK pings---");
    expect(container).toHaveTextContent("Average ping time---");
    expect(container).toHaveTextContent("PortsError");
    expect(container.querySelectorAll(".saucer.red")).toHaveLength(1);
    expect(container.querySelectorAll(".saucer.gray")).toHaveLength(2);
  });

  it("calculates WiFi percentage from the signal level", () => {
    const bot = clone(fakeBot);
    bot.hardware.informational_settings.wifi_level = -50;
    const device = fakeDevice();
    const { container } = render(<ConnectivityPopupContent
      bot={bot}
      data={popupData(bot, device)} />);
    expect(container.querySelector(".percent-bar-fill.yellow"))
      .toHaveStyle({ width: "80%" });
  });
});
