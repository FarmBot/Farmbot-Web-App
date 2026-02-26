import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimezoneRow } from "../timezone_row";
import { TimezoneRowProps } from "../interfaces";
import * as crud from "../../../api/crud";
import { Content } from "../../../constants";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import * as timezoneSelector from "../../../devices/timezones/timezone_selector";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let timezoneSelectorSpy: jest.SpyInstance;
const EDIT_ACTION = { type: "EDIT_RESOURCE" };
const SAVE_ACTION = { type: "SAVE_RESOURCE_START" };

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(() => EDIT_ACTION as never);
  saveSpy = jest.spyOn(crud, "save").mockImplementation(() => SAVE_ACTION as never);
  timezoneSelectorSpy = jest.spyOn(timezoneSelector, "TimezoneSelector")
    .mockImplementation((props: { onUpdate: (timezone: string) => void }) =>
      <button onClick={() => props.onUpdate("America/Los_Angeles")}>
        select-timezone
      </button>);
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
  timezoneSelectorSpy.mockRestore();
});

describe("<TimezoneRow />", () => {
  const fakeProps = (): TimezoneRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
  });

  it("warns about timezone mismatch", () => {
    const p = fakeProps();
    p.device.body.timezone = "different";
    render(<TimezoneRow {...p} />);
    expect(screen.getByText(Content.DIFFERENT_TZ_WARNING)).toBeInTheDocument();
  });

  it("select timezone", () => {
    const p = fakeProps();
    render(<TimezoneRow {...p} />);
    fireEvent.click(screen.getByText("select-timezone"));
    expect(crud.edit).toHaveBeenCalledWith(p.device,
      { timezone: "America/Los_Angeles" });
    expect(crud.save).toHaveBeenCalledWith(p.device.uuid);
    expect(p.dispatch).toHaveBeenCalledWith(EDIT_ACTION);
    expect(p.dispatch).toHaveBeenCalledWith(SAVE_ACTION);
  });
});
