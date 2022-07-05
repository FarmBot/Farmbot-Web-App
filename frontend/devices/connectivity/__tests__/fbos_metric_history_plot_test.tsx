import React from "react";
import { svgMount } from "../../../__test_support__/svg_mount";
import {
  FbosMetricHistoryPlot, FbosMetricHistoryPlotProps,
} from "../fbos_metric_history_plot";

describe("<FbosMetricHistoryPlot />", () => {
  const fakeProps = (): FbosMetricHistoryPlotProps => ({
    telemetry: [],
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = svgMount(<FbosMetricHistoryPlot {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
  });
});
