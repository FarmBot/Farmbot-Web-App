import React from "react";
import { svgMount } from "../../../__test_support__/svg_mount";
import {
  FbosMetricHistoryPlot, FbosMetricHistoryPlotProps,
} from "../fbos_metric_history_plot";
import { fakeTelemetry } from "../../../__test_support__/fake_state/resources";

describe("<FbosMetricHistoryPlot />", () => {
  const fakeProps = (): FbosMetricHistoryPlotProps => {
    const telemetry0 = fakeTelemetry();
    telemetry0.body.created_at = 0 as unknown as string;
    const telemetry1 = fakeTelemetry();
    telemetry1.body.created_at = 1 as unknown as string;
    telemetry1.body.cpu_usage = undefined;
    const telemetry2 = fakeTelemetry();
    telemetry2.body.created_at = 2 as unknown as string;
    telemetry2.body.throttled = undefined;
    return {
      telemetry: [telemetry0, telemetry1, telemetry2],
      onHover: jest.fn(),
      hoveredMetric: undefined,
      hoveredTime: undefined,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
    expect(wrapper.find("path").first().props().strokeWidth).toEqual(2);
  });

  it("renders when hovered", () => {
    const p = fakeProps();
    p.hoveredMetric = "cpu_usage";
    p.hoveredTime = 1;
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.find("path").first().props().strokeWidth).toEqual(4);
  });
});
