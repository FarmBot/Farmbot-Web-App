import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import {
  MissedStepIndicator, MissedStepIndicatorProps, MISSED_STEP_HISTORY_LENGTH,
} from "../missed_step_indicator";
import { range } from "lodash";

describe("<MissedStepIndicator />", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  const fakeProps = (): MissedStepIndicatorProps => ({
    missedSteps: undefined,
    axis: "x",
  });

  it.each<[
    number | undefined, number[] | undefined, string, string, string, string
  ]>([
    [undefined, undefined, "0%", "green", "0%", "green"],
    [0, undefined, "0%", "green", "0%", "green"],
    [10, [90], "10%", "green", "90%", "red"],
    [50, undefined, "50%", "yellow", "50%", "yellow"],
    [50, [80, 0], "50%", "yellow", "80%", "orange"],
    [75, undefined, "75%", "orange", "75%", "orange"],
    [90, undefined, "90%", "red", "90%", "red"],
  ])("renders indicator for %s missed steps", (
    missedSteps, history, instant, instantColor, peak, peakColor,
  ) => {
    const p = fakeProps();
    p.missedSteps = missedSteps;
    const ref = React.createRef<MissedStepIndicator>();
    const { container } = render(<MissedStepIndicator ref={ref} {...p} />);
    history && act(() => ref.current?.setState({ history }));
    const instantEl = container.querySelector(".instant");
    const peakEl = container.querySelector(".peak");
    expect(instantEl?.getAttribute("style")).toContain(`width: ${instant}`);
    expect(instantEl?.classList.contains(instantColor)).toEqual(true);
    expect(peakEl?.getAttribute("style")).toContain(`margin-left: ${peak}`);
    expect(peakEl?.classList.contains(peakColor)).toEqual(true);
  });

  it("updates missed step history", () => {
    const p = fakeProps();
    const ref = React.createRef<MissedStepIndicator>();
    const { rerender } = render(<MissedStepIndicator ref={ref} {...p} />);
    expect(ref.current?.state.history).toEqual([]);
    p.missedSteps = 10;
    rerender(<MissedStepIndicator ref={ref} {...p} />);
    expect(ref.current?.state.history).toEqual([10]);
  });

  it("doesn't update missed step history", () => {
    const p = fakeProps();
    p.missedSteps = 10;
    const ref = React.createRef<MissedStepIndicator>();
    render(<MissedStepIndicator ref={ref} {...p} />);
    act(() => ref.current?.componentDidUpdate());
    expect(ref.current?.state.history).toEqual([10]);
    act(() => ref.current?.componentDidUpdate());
    expect(ref.current?.state.history).toEqual([10]);
  });

  it("limits missed step history length", () => {
    const p = fakeProps();
    p.missedSteps = 10;
    const ref = React.createRef<MissedStepIndicator>();
    render(<MissedStepIndicator ref={ref} {...p} />);
    act(() => ref.current?.setState({ history: range(30) }));
    act(() => ref.current?.componentDidUpdate());
    const start = 30 - MISSED_STEP_HISTORY_LENGTH + 1;
    expect(ref.current?.state.history).toEqual(range(start, 30).concat([10]));
  });

  it.each<[
    number | undefined, number[], string, string, string,
  ]>([
    [undefined, [], "latest:0%", "max:0%", "average:0%"],
    [10, [], "latest:10%", "max:10%", "average:10%"],
    [10, [90], "latest:10%", "max:90%", "average:50%"],
    [10, [0, 100], "latest:10%", "max:100%", "average:37%"],
  ])("displays details for history: %s", (
    missedSteps, history, latest, max, average,
  ) => {
    const p = fakeProps();
    p.missedSteps = missedSteps;
    const ref = React.createRef<MissedStepIndicator>();
    const { container } = render(<MissedStepIndicator ref={ref} {...p} />);
    act(() => ref.current?.setState({ history }));
    const indicator = container.querySelector(".missed-step-indicator-wrapper");
    expect(indicator).toBeTruthy();
    indicator && fireEvent.click(indicator);
    ["motor load", latest, max, average].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(
        string.toLowerCase()));
  });

  it("loads history", () => {
    sessionStorage.setItem("missed_step_history_x", "[1,2,3]");
    const ref = React.createRef<MissedStepIndicator>();
    render(<MissedStepIndicator ref={ref} {...fakeProps()} />);
    expect(ref.current?.state.history).toEqual([1, 2, 3]);
  });

  it("saves history", () => {
    const ref = React.createRef<MissedStepIndicator>();
    const { unmount } = render(<MissedStepIndicator ref={ref} {...fakeProps()} />);
    act(() => ref.current?.setState({ history: [1, 2, 3] }));
    unmount();
    expect(sessionStorage.getItem("missed_step_history_x")).toEqual("[1,2,3]");
  });

  it("toggles details", () => {
    const ref = React.createRef<MissedStepIndicator>();
    const { container } = render(<MissedStepIndicator ref={ref} {...fakeProps()} />);
    const indicator = container.querySelector(".missed-step-indicator-wrapper");
    expect(indicator).toBeTruthy();
    indicator && fireEvent.click(indicator);
    expect(ref.current?.state.open).toEqual(true);
  });
});
