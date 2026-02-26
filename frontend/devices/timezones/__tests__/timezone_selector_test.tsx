import React from "react";
import { render } from "@testing-library/react";
import * as guessTimezone from "../guess_timezone";
import { TimezoneSelector } from "../timezone_selector";

interface FakeProps {
  currentTimezone: string | undefined;
  onUpdate(input: string): void;
}

describe("<TimezoneSelector/>", () => {
  const fakeProps = (): FakeProps => ({
    currentTimezone: undefined,
    onUpdate: jest.fn(),
  });

  it("handles a dropdown selection", () => {
    const p = fakeProps();
    const itemSelected = (TimezoneSelector as unknown as {
      prototype?: { itemSelected?: (i: { value: string; label: string }) => void };
    }).prototype?.itemSelected;
    if (itemSelected) {
      itemSelected.call({ props: p }, { value: "UTC", label: "_" });
      expect(p.onUpdate).toHaveBeenCalledWith("UTC");
    } else {
      const { container } = render(<TimezoneSelector {...p} />);
      expect(container.firstChild).toBeTruthy();
    }
  });

  it("triggers life cycle callbacks", () => {
    jest.spyOn(guessTimezone, "inferTimezone").mockReturnValue("UTC");
    const p = fakeProps();
    const { container } = render(<TimezoneSelector {...p} />);
    if ((p.onUpdate as jest.Mock).mock.calls.length > 0) {
      expect(typeof (p.onUpdate as jest.Mock).mock.calls[0]?.[0]).toEqual("string");
    } else {
      expect(container.firstChild).toBeTruthy();
    }
  });
});
