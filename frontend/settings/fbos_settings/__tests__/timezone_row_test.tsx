jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TimezoneRow } from "../timezone_row";
import { TimezoneRowProps } from "../interfaces";
import { edit } from "../../../api/crud";
import { Content } from "../../../constants";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

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
    const selector = screen.getByRole("combobox");
    fireEvent.click(selector);
    const item = screen.getByText("America/Los_Angeles");
    fireEvent.click(item);
    expect(edit).toHaveBeenCalledWith(p.device,
      { timezone: "America/Los_Angeles" });
  });
});
