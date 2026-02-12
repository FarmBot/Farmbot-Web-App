import React from "react";
import { render } from "@testing-library/react";
import { FirmwareAlerts, sortAlerts, Alerts } from "../alerts";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { AlertsProps, FirmwareAlertsProps } from "../interfaces";
import { Alert } from "farmbot";

const FIRMWARE_MISSING_ALERT: Alert = {
  created_at: 123,
  problem_tag: "farmbot_os.firmware.missing",
  priority: 100,
  slug: "slug1",
};

const SEED_DATA_MISSING_ALERT: Alert = {
  created_at: 123,
  problem_tag: "api.seed_data.missing",
  priority: 300,
  slug: "slug3",
};

const UNKNOWN_ALERT: Alert = {
  created_at: 123,
  problem_tag: "farmbot_os.firmware.alert",
  priority: 200,
  slug: "slug2",
};

const UNKNOWN_ALERT_2: Alert = {
  created_at: 456,
  problem_tag: "farmbot_os.firmware.alert",
  priority: 100,
  slug: "slug4",
};

describe("<Alerts />", () => {
  const fakeProps = (): AlertsProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    findApiAlertById: jest.fn(),
  });

  it("renders no alerts", () => {
    const { container } = render(<Alerts {...fakeProps()} />);
    expect(container.innerHTML).toContain(
      "<div class=\"problem-alerts\">"
      + "<div class=\"problem-alerts-content grid double-gap\"></div>"
      + "</div>");
  });

  it("renders alerts", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT, SEED_DATA_MISSING_ALERT];
    const { container } = render(<Alerts {...p} />);
    expect(container.textContent).not.toContain("Your device has no firmware");
    expect(container.textContent).toContain("Choose your FarmBot");
  });

  it("renders unknown alert", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT, UNKNOWN_ALERT];
    const { container } = render(<Alerts {...p} />);
    expect(container.textContent).toContain("firmware: alert");
  });
});

describe("<FirmwareAlerts />", () => {
  const fakeProps = (): FirmwareAlertsProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  it("renders no alerts", () => {
    const p = fakeProps();
    p.alerts = [];
    const { container } = render(<FirmwareAlerts {...p} />);
    expect(container.innerHTML).toEqual("<div class=\"firmware-alerts\"></div>");
  });

  it("renders alerts", () => {
    const p = fakeProps();
    p.alerts = [FIRMWARE_MISSING_ALERT, UNKNOWN_ALERT];
    const { container } = render(<FirmwareAlerts {...p} />);
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("Your device has no firmware");
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
