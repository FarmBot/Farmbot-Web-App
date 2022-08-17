import React from "react";
import { svgMount } from "../../../__test_support__/svg_mount";
import {
  FbosMetricHistoryPlot, FbosMetricHistoryPlotProps,
} from "../fbos_metric_history_plot";
import { fakeTelemetry } from "../../../__test_support__/fake_state/resources";

describe("<FbosMetricHistoryPlot />", () => {
  const fakeProps = (): FbosMetricHistoryPlotProps => {
    const telemetry0 = fakeTelemetry();
    telemetry0.body.created_at = 0;
    const telemetry1 = fakeTelemetry();
    telemetry1.body.created_at = 1;
    telemetry1.body.cpu_usage = undefined;
    telemetry1.body.fbos_version = "1.2.3";
    const telemetry2 = fakeTelemetry();
    telemetry2.body.created_at = 2;
    telemetry2.body.throttled = undefined;
    telemetry2.body.fbos_version = "4.5.6";
    const telemetry3 = fakeTelemetry();
    telemetry3.body.created_at = 3;
    telemetry3.body.fbos_version = undefined;
    const telemetry4 = fakeTelemetry();
    telemetry4.body.created_at = 20 * 60;
    telemetry4.body.fbos_version = undefined;
    return {
      telemetry: [telemetry0, telemetry1, telemetry2, telemetry3, telemetry4],
      onHover: jest.fn(),
      hoveredMetric: undefined,
      hoveredTime: undefined,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
    expect(wrapper.find("path").first().props().strokeWidth).toEqual(1.5);
  });

  it("renders: demo accounts", () => {
    const p = fakeProps();
    p.telemetry.map(r => r.body.target = "demo");
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
    expect(wrapper.find("path").first().props().strokeWidth).toEqual(1.5);
  });

  it("handles missing data", () => {
    const p = fakeProps();
    p.telemetry = [];
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
  });

  it("renders when hovered", () => {
    const p = fakeProps();
    p.hoveredMetric = "cpu_usage";
    p.hoveredTime = 1;
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.find("path").first().props().strokeWidth).toEqual(2.5);
  });
});
