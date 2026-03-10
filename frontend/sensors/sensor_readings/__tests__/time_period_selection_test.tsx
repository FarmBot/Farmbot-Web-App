import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  TimePeriodSelection, getEndDate, DateDisplay,
} from "../time_period_selection";
import { fakeSensorReading } from "../../../__test_support__/fake_state/resources";
import { TimePeriodSelectionProps, DateDisplayProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as ui from "../../../ui";

let fbSelectSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: { label: string };
      onChange: (ddi: { label: string; value: number }) => void;
    }) =>
      <button className="fb-select-mock"
        onClick={() => props.onChange({ label: "", value: 100 })}>
        {props.selectedItem?.label}
      </button>);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation((props: {
      value: string;
      onCommit: (e: { currentTarget: { value: string } }) => void;
    }) =>
      <input className="blurable-input-mock"
        defaultValue={props.value}
        onBlur={e => props.onCommit({
          currentTarget: { value: e.currentTarget.value }
        })}
        onChange={() => { }} />);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
  blurableInputSpy.mockRestore();
});

describe("<TimePeriodSelection />", () => {
  function fakeProps(): TimePeriodSelectionProps {
    return {
      timePeriod: 3600 * 24,
      endDate: 1515715140,
      showPreviousPeriod: false,
      setEndDate: jest.fn(),
      setPeriod: jest.fn(),
      togglePrevious: jest.fn(),
    };
  }

  it("renders", () => {
    const { container } = render(<TimePeriodSelection {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["time period", "day", "period end date", "show previous"]
      .map(string => expect(txt).toContain(string));
  });

  it("changes time period", () => {
    const p = fakeProps();
    const { container } = render(<TimePeriodSelection {...p} />);
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
    expect(p.setPeriod).toHaveBeenCalledWith(100);
  });

  it("changes end date", () => {
    const p = fakeProps();
    const { container } = render(<TimePeriodSelection {...p} />);
    const input = container.querySelector(".blurable-input-mock") as Element;
    fireEvent.change(input, { target: { value: "2002-01-10" } });
    fireEvent.blur(input);
    expect(p.setEndDate).toHaveBeenCalledWith(expect.any(Number));
  });

  it("updates end date", () => {
    const p = fakeProps();
    const { container } = render(<TimePeriodSelection {...p} />);
    fireEvent.click(container.querySelector("i") as Element);
    expect(p.setEndDate).toHaveBeenCalled();
  });
});

describe("getEndDate()", () => {
  it("returns recent reading date", () => {
    expect(getEndDate([fakeSensorReading()])).toEqual(expect.any(Number));
  });

  it("returns current date", () => {
    expect(getEndDate([])).toEqual(expect.any(Number));
  });
});

describe("<DateDisplay />", () => {
  function fakeProps(): DateDisplayProps {
    return {
      timePeriod: 3600 * 24 * 7,
      endDate: 1515715140,
      showPreviousPeriod: true,
      timeSettings: fakeTimeSettings(),
    };
  }

  it("renders", () => {
    const { container } = render(<DateDisplay {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["date", "january 4–january 11 (december 28–january 4)"]
      .map(string => expect(txt).toContain(string));
  });
});
