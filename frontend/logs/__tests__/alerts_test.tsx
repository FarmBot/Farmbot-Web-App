import * as React from "react";
import { mount } from "enzyme";
import {
  Alerts, AlertsProps, Alert, FirmwareAlerts, FirmwareAlertsProps
} from "../alerts";
import { bot } from "../../__test_support__/fake_state/bot";

const FIRMWARE_MISSING_ALERT: Alert = {
  created_at: "123",
  updated_at: "456",
  problem_tag: "firmware.missing",
  priority: 100,
};

const UNKNOWN_ALERT: Alert = {
  created_at: "123",
  updated_at: "456",
  problem_tag: "firmware.alert",
  priority: 100,
};

describe("<Alerts />", () => {
  const fakeProps = (): AlertsProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
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
  });

  it("renders no alerts", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.bot.hardware.enigmas = undefined as any;
    const wrapper = mount(<FirmwareAlerts {...p} />);
    expect(wrapper.html()).toEqual(`<div class="firmware-alerts"></div>`);
  });

  it("renders alerts", () => {
    const p = fakeProps();
    p.bot.hardware.enigmas = {
      "firmware.missing": FIRMWARE_MISSING_ALERT,
      "firmware.alert": UNKNOWN_ALERT
    };
    const wrapper = mount(<FirmwareAlerts {...p} />);
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("Your device has no firmware installed");
  });
});
