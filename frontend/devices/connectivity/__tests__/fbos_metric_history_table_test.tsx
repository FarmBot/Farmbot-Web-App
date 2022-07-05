import React from "react";
import { fakeTelemetry } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { svgMount } from "../../../__test_support__/svg_mount";
import {
  FbosMetricHistoryTable, FbosMetricHistoryTableProps,
} from "../fbos_metric_history_table";

describe("<FbosMetricHistoryTable />", () => {
  const fakeProps = (): FbosMetricHistoryTableProps => {
    const telemetry0 = fakeTelemetry();
    telemetry0.body.created_at = 0 as unknown as string;
    const telemetry1 = fakeTelemetry();
    telemetry1.body.created_at = 1 as unknown as string;
    const telemetry2 = fakeTelemetry();
    telemetry2.body.created_at = 2 as unknown as string;
    telemetry2.body.throttled = undefined;
    return {
      telemetry: [telemetry0, telemetry1, telemetry2],
      timeSettings: fakeTimeSettings(),
      hidden: false,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = svgMount(<FbosMetricHistoryTable {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("hours");
  });
});
