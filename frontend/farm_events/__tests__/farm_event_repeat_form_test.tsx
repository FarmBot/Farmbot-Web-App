import React from "react";
import {
  FarmEventRepeatFormProps, FarmEventRepeatForm,
} from "../farm_event_repeat_form";
import { fireEvent, render } from "@testing-library/react";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { DropDownItem } from "../../ui";

let mockFBSelectProps: {
  disabled?: boolean;
  selectedItem?: DropDownItem;
  onChange: (ddi: DropDownItem) => void;
} | undefined;

jest.mock("../../ui", () => {
  const React = require("react");
  return {
    Row: ({ children, className }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
    BlurableInput: (props: {
      name: string;
      disabled?: boolean;
      value: string;
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void;
    }) => <input
      data-testid={`blurable-${props.name}`}
      name={props.name}
      defaultValue={props.value}
      disabled={props.disabled}
      onChange={() => { }}
      onBlur={e => props.onCommit(e)} />,
    FBSelect: (props: {
      disabled?: boolean;
      selectedItem?: DropDownItem;
      onChange: (ddi: DropDownItem) => void;
    }) => {
      mockFBSelectProps = props;
      return <button
        data-testid={"time-unit"}
        disabled={props.disabled}
        onClick={() => props.onChange({ label: "Daily", value: "daily" })} />;
    },
  };
});

jest.mock("../event_time_picker", () => {
  const React = require("react");
  return {
    EventTimePicker: (props: {
      name: string;
      disabled?: boolean;
      value: string;
      onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => void;
    }) => <input
      data-testid={`event-time-${props.name}`}
      name={props.name}
      defaultValue={props.value}
      disabled={props.disabled}
      onChange={() => { }}
      onBlur={e => props.onCommit(e)} />,
  };
});

const fakeProps = (): FarmEventRepeatFormProps => ({
  disabled: false,
  hidden: false,
  fieldSet: jest.fn(),
  timeUnit: "daily",
  repeat: "1",
  endDate: "2017-07-26",
  endTime: "08:57",
  timeSettings: fakeTimeSettings(),
});

enum Selectors {
  REPEAT = "blurable-repeat",
  END_DATE = "blurable-endDate",
  END_TIME = "event-time-endTime",
}

describe("<FarmEventRepeatForm/>", () => {
  beforeEach(() => {
    mockFBSelectProps = undefined;
  });

  it("shows proper values", () => {
    const p = fakeProps();
    const { container } = render<FarmEventRepeatFormProps>(
      <FarmEventRepeatForm {...p} />);
    expect((container.querySelector(
      `[data-testid="${Selectors.REPEAT}"]`) as HTMLInputElement).value)
      .toEqual(p.repeat);
    expect((container.querySelector(
      `[data-testid="${Selectors.END_DATE}"]`) as HTMLInputElement).value)
      .toEqual(p.endDate);
    expect((container.querySelector(
      `[data-testid="${Selectors.END_TIME}"]`) as HTMLInputElement).value)
      .toEqual(p.endTime);
    expect(mockFBSelectProps?.selectedItem?.value)
      .toEqual(p.timeUnit);
  });

  it("defaults to `daily` when a bad input it passed", () => {
    const p = fakeProps();
    p.timeUnit = "never" as "daily";
    const { container } = render<FarmEventRepeatFormProps>(
      <FarmEventRepeatForm {...p} />);
    expect((container.querySelector(
      `[data-testid="${Selectors.REPEAT}"]`) as HTMLInputElement).value)
      .toEqual(p.repeat);
    expect(mockFBSelectProps?.selectedItem?.value).toEqual("daily");
  });

  it("disables all inputs via the `disabled` prop", () => {
    const p = fakeProps();
    p.disabled = true;
    const { container } = render<FarmEventRepeatFormProps>(
      <FarmEventRepeatForm {...p} />);
    expect(container.querySelector(`[data-testid="${Selectors.END_DATE}"]`))
      .toBeDisabled();
    expect(container.querySelector(`[data-testid="${Selectors.END_TIME}"]`))
      .toBeDisabled();
    expect(container.querySelector(`[data-testid="${Selectors.REPEAT}"]`))
      .toBeDisabled();
    expect(container.querySelectorAll("button").length).toEqual(1);
  });

  it("hides", () => {
    const p = fakeProps();
    p.hidden = true;
    const { container } = render(<FarmEventRepeatForm {...p} />);
    expect(container.textContent).toEqual("");
  });

  const testBlurable = (input: Selectors, field: string, value: string) => {
    const p = fakeProps();
    const { container } = render(<FarmEventRepeatForm {...p} />);
    const element = container.querySelector(`[data-testid="${input}"]`);
    fireEvent.change(element as Element, {
      target: { value },
    });
    fireEvent.blur(element as Element);
    expect(p.fieldSet).toHaveBeenCalledWith(field, value);
  };

  it("changes repeat frequency", () => {
    testBlurable(Selectors.REPEAT, "repeat", "1");
  });

  it("changes time unit", () => {
    const p = fakeProps();
    const { container } = render(<FarmEventRepeatForm {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.fieldSet).toHaveBeenCalledWith("timeUnit", "daily");
  });

  it("changes end date", () => {
    testBlurable(Selectors.END_DATE, "endDate", "2017-07-26");
  });

  it("changes end time", () => {
    testBlurable(Selectors.END_TIME, "endTime", "08:57");
  });
});

afterAll(() => {
  jest.unmock("../../ui");
});
