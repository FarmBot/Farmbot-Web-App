import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BulkScheduler, nearOsUpdateTime } from "../bulk_scheduler";
import { BulkEditorProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { newWeek } from "../../reducer";
import { changeBlurableInput } from "../../../__test_support__/helpers";

describe("<BulkScheduler />", () => {
  const week = newWeek();
  week.days.day1 = true;
  const weeks = [week];

  function fakeProps(): BulkEditorProps {
    const sequence = fakeSequence();
    sequence.body.name = "Fake Sequence";
    const sequenceWithoutId = fakeSequence();
    sequenceWithoutId.body.id = undefined;
    return {
      selectedSequence: sequence,
      dailyOffsetMs: 3600000,
      weeks,
      sequences: [fakeSequence(), fakeSequence(), sequenceWithoutId],
      resources: buildResourceIndex([]).index,
      dispatch: jest.fn(),
      device: fakeDevice(),
    };
  }

  const renderWithRef = (props: BulkEditorProps) => {
    const ref = React.createRef<BulkScheduler>();
    const utils = render(<BulkScheduler ref={ref} {...props} />);
    expect(ref.current).toBeTruthy();
    return { ...utils, ref };
  };

  it("renders with sequence selected", () => {
    const { container } = render(<BulkScheduler {...fakeProps()} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toEqual(5);
    ["Sequence", "Fake Sequence", "Time",
      "Days", "Week 1", "1234567"]
      .map(string =>
        expect(container.textContent).toContain(string));
  });

  it("renders without sequence selected", () => {
    const p = fakeProps();
    p.selectedSequence = undefined;
    const { container } = render(<BulkScheduler {...p} />);
    ["Sequence", "None", "Time"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("changes time", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const { ref } = renderWithRef(p);
    const { container } = render(<>{ref.current?.TimeSelection()}</>);
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("01:00");
    changeBlurableInput(container, "02:00");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 7200000,
      type: Actions.SET_TIME_OFFSET
    });
  });

  it("sets current time", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const { ref } = renderWithRef(p);
    const { container } = render(<>{ref.current?.TimeSelection()}</>);
    fireEvent.click(container.querySelector(".fa-clock-o") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.any(Number),
      type: Actions.SET_TIME_OFFSET
    });
  });

  it("changes sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const { ref } = renderWithRef(p);
    ref.current?.onChange({ value: "Sequence" } as never);
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: "Sequence",
      type: Actions.SET_SEQUENCE
    });
  });

  it("doesn't change sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const { ref } = renderWithRef(p);
    const change = () => ref.current?.onChange({ value: 4 } as never);
    expect(change).toThrow("WARNING: Not a sequence UUID.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("shows warning", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.device.body.ota_hour = 3;
    p.dailyOffsetMs = 10800000;
    const { ref } = renderWithRef(p);
    const { container } = render(<>{ref.current?.TimeSelection()}</>);
    changeBlurableInput(container, "03:00");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 10800000,
      type: Actions.SET_TIME_OFFSET
    });
    expect(container.querySelector("input")?.classList.contains("error")).toBeTruthy();
  });

  it("doesn't show warning", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.device.body.ota_hour = undefined;
    p.dailyOffsetMs = 10800000;
    const { ref } = renderWithRef(p);
    const { container } = render(<>{ref.current?.TimeSelection()}</>);
    changeBlurableInput(container, "03:00");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 10800000,
      type: Actions.SET_TIME_OFFSET
    });
    expect(container.querySelector("input")?.classList.contains("error")).toBeFalsy();
  });
});

describe("nearOsUpdateTime()", () => {
  it("returns result", () => {
    expect(nearOsUpdateTime(0, 0)).toBeTruthy();
    expect(nearOsUpdateTime(23.5 * 60 * 60 * 1000, 0)).toBeTruthy();
    expect(nearOsUpdateTime(0, undefined)).toBeFalsy();
    expect(nearOsUpdateTime(2.5 * 60 * 60 * 1000, 3)).toBeTruthy();
  });
});
