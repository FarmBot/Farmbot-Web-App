let mockDemo = false;
import React from "react";
import { act, render } from "@testing-library/react";
import { fakeTelemetry } from "../../../__test_support__/fake_state/resources";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as historyPlot from "../fbos_metric_history_plot";
import * as mustBeOnline from "../../must_be_online";
import {
  FbosMetricHistoryTable, FbosMetricHistoryTableProps,
} from "../fbos_metric_history_table";

beforeEach(() => {
  jest.spyOn(historyPlot, "FbosMetricHistoryPlot").mockImplementation(() => <div />);
  jest.spyOn(mustBeOnline, "forceOnline").mockImplementation(() => mockDemo);
});

afterEach(() => {
  mockDemo = false;
  jest.restoreAllMocks();
});
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
    const ref = React.createRef<FbosMetricHistoryTable>();
    const { container } = render(<FbosMetricHistoryTable {...p} ref={ref} />);
    expect(ref.current?.telemetry.length).toEqual(3);
    expect(container.textContent?.toLowerCase()).toContain("wifi");
  });

  it("renders demo data", () => {
    mockDemo = true;
    const p = fakeProps();
    const ref = React.createRef<FbosMetricHistoryTable>();
    const { container } = render(<FbosMetricHistoryTable {...p} ref={ref} />);
    expect(ref.current?.telemetry.length).toEqual(100);
    expect(container.textContent?.toLowerCase()).toContain("wifi");
  });

  it("sets metric hover state", () => {
    const p = fakeProps();
    const ref = React.createRef<FbosMetricHistoryTable>();
    const { container } = render(<FbosMetricHistoryTable {...p} ref={ref} />);
    const headers = container.querySelectorAll("th");
    const backgroundBefore = (headers[headers.length - 1] as HTMLTableCellElement)
      .style.background;
    expect(backgroundBefore).toEqual("");
    expect(ref.current?.state.hoveredMetric).toEqual(undefined);
    act(() => ref.current?.hoverMetric("wifi_level_percent")());
    expect(ref.current?.state.hoveredMetric).toEqual("wifi_level_percent");
    const headersAfter = container.querySelectorAll("th");
    const backgroundAfter = (headersAfter[headersAfter.length - 1] as HTMLTableCellElement)
      .style.background;
    expect(backgroundAfter).toEqual("rgba(255, 255, 255, 0.2)");
  });

  it("sets time hover state", () => {
    const p = fakeProps();
    const ref = React.createRef<FbosMetricHistoryTable>();
    const { container } = render(<FbosMetricHistoryTable {...p} ref={ref} />);
    const firstCell = container.querySelector("td") as HTMLTableCellElement;
    const backgroundBefore = firstCell.style.background;
    expect(backgroundBefore).toEqual("");
    expect(ref.current?.state.hoveredTime).toEqual(undefined);
    act(() => ref.current?.hoverTime(2)());
    expect(ref.current?.state.hoveredTime).toEqual(2);
    const firstCellAfter = container.querySelector("td") as HTMLTableCellElement;
    const backgroundAfter = firstCellAfter.style.background;
    expect(backgroundAfter).toEqual("rgba(255, 255, 255, 0.2)");
  });
});
