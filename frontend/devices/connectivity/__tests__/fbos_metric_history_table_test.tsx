jest.mock("../fbos_metric_history_plot", () => ({
  FbosMetricHistoryPlot: () => <div />,
}));

let mockDemo = false;
jest.mock("../../must_be_online", () => ({
  forceOnline: () => mockDemo,
}));

import React from "react";
import { mount } from "enzyme";
import { fakeTelemetry } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import {
  FbosMetricHistoryTable, FbosMetricHistoryTableProps,
} from "../fbos_metric_history_table";

describe("<FbosMetricHistoryTable />", () => {
  const fakeProps = (): FbosMetricHistoryTableProps => {
    const telemetry0 = fakeTelemetry();
    telemetry0.body.created_at = 0;
    const telemetry1 = fakeTelemetry();
    telemetry1.body.created_at = 1;
    const telemetry2 = fakeTelemetry();
    telemetry2.body.created_at = 2;
    telemetry2.body.throttled = undefined;
    return {
      telemetry: [telemetry0, telemetry1, telemetry2],
      timeSettings: fakeTimeSettings(),
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount<FbosMetricHistoryTable>(
      <FbosMetricHistoryTable {...p} />);
    expect(wrapper.instance().telemetry.length).toEqual(3);
    expect(wrapper.text().toLowerCase()).toContain("wifi");
  });

  it("renders demo data", () => {
    mockDemo = true;
    const p = fakeProps();
    const wrapper = mount<FbosMetricHistoryTable>(
      <FbosMetricHistoryTable {...p} />);
    expect(wrapper.instance().telemetry.length).toEqual(100);
    expect(wrapper.text().toLowerCase()).toContain("wifi");
    mockDemo = false;
  });

  it("sets metric hover state", () => {
    const p = fakeProps();
    const wrapper = mount<FbosMetricHistoryTable>(
      <FbosMetricHistoryTable {...p} />);
    const backgroundBefore = wrapper.find("th").last().props().style?.background;
    expect(backgroundBefore).toEqual(undefined);
    expect(wrapper.instance().state.hoveredMetric).toEqual(undefined);
    wrapper.instance().hoverMetric("wifi_level_percent")();
    expect(wrapper.instance().state.hoveredMetric).toEqual("wifi_level_percent");
    wrapper.update();
    const backgroundAfter = wrapper.find("th").last().props().style?.background;
    expect(backgroundAfter).toEqual("rgba(255,255,255,0.2)");
  });

  it("sets time hover state", () => {
    const p = fakeProps();
    const wrapper = mount<FbosMetricHistoryTable>(
      <FbosMetricHistoryTable {...p} />);
    const backgroundBefore = wrapper.find("td").first().props().style?.background;
    expect(backgroundBefore).toEqual(undefined);
    expect(wrapper.instance().state.hoveredTime).toEqual(undefined);
    wrapper.instance().hoverTime(2)();
    expect(wrapper.instance().state.hoveredTime).toEqual(2);
    wrapper.update();
    const backgroundAfter = wrapper.find("td").first().props().style?.background;
    expect(backgroundAfter).toEqual("rgba(255,255,255,0.2)");
  });
});
