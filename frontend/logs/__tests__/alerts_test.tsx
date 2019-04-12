import * as React from "react";
import { mount } from "enzyme";
import {
  Alerts, AlertsProps, Alert, FirmwareAlerts, FirmwareAlertsProps, sortAlerts
} from "../alerts";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

const FIRMWARE_MISSING_ALERT: Alert = {
  created_at: 123,
  problem_tag: "farmbot_os.firmware.missing",
  priority: 100,
  uuid: "uuid",
};

const UNKNOWN_ALERT: Alert = {
  created_at: 123,
  problem_tag: "farmbot_os.firmware.alert",
  priority: 200,
  uuid: "uuid",
};

const UNKNOWN_ALERT_2: Alert = {
  created_at: 456,
  problem_tag: "farmbot_os.firmware.alert",
  priority: 100,
  uuid: "uuid",
};

describe("<Alerts />", () => {
  const fakeProps = (): AlertsProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
  });

  it("renders no alerts", () => {
    const wrapper = mount(<Alerts {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<div></div>");
  });

  it("renders alerts", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT];
    const wrapper = mount(<Alerts {...p} />);
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("Your device has no firmware installed");
  });

  it("renders unknown alert", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT, UNKNOWN_ALERT];
    const wrapper = mount(<Alerts {...p} />);
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("firmware: alert");
  });

  it("collapses alerts", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT];
    const wrapper = mount<Alerts>(<Alerts {...p} />);
    expect(wrapper.state().open).toEqual(true);
    wrapper.find(".problem-alerts-header").simulate("click");
    expect(wrapper.state().open).toEqual(false);
  });
});

describe("<FirmwareAlerts />", () => {
  const fakeProps = (): FirmwareAlertsProps => ({
    bot,
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
  });

  it("renders no alerts", () => {
    const p = fakeProps();
    p.bot.hardware.enigmas = undefined;
    const wrapper = mount(<FirmwareAlerts {...p} />);
    expect(wrapper.html()).toEqual(`<div class="firmware-alerts"></div>`);
  });

  it("renders alerts", () => {
    const p = fakeProps();
    p.bot.hardware.enigmas = {
      "uuid1": FIRMWARE_MISSING_ALERT,
      "uuid2": UNKNOWN_ALERT
    };
    const wrapper = mount(<FirmwareAlerts {...p} />);
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("Your device has no firmware installed");
  });
});

describe("sortAlerts()", () => {
  it("sorts alerts", () => {
    const result = sortAlerts([
      UNKNOWN_ALERT, UNKNOWN_ALERT_2, FIRMWARE_MISSING_ALERT]);
    expect(result).toEqual([
      FIRMWARE_MISSING_ALERT, UNKNOWN_ALERT_2, UNKNOWN_ALERT]);
  });
});
