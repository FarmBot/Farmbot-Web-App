import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { LogsFilterMenu, NON_FILTER_SETTINGS } from "../filter_menu";
import { LogsFilterMenuProps, LogsState } from "../../interfaces";
import { MESSAGE_TYPES } from "../../../sequences/interfaces";

jest.mock("@blueprintjs/core", () => ({
  Slider: (props: {
    onChange?: (value: number) => void;
    onRelease?: (value: number) => void;
  }) =>
    <button className={"mock-slider"}
      onClick={() => {
        props.onChange?.(2);
        props.onRelease?.(2);
      }} />,
}));

const logTypes = MESSAGE_TYPES;

describe("<LogsFilterMenu />", () => {
  const fakeState: LogsState = {
    autoscroll: true, markdown: false, searchTerm: "", currentFbosOnly: false,
    success: 1, busy: 1, warn: 1,
    error: 1, info: 1, fun: 1, debug: 1, assertion: 1,
  };

  const fakeProps = (): LogsFilterMenuProps => ({
    toggle: jest.fn(),
    setFilterLevel: jest.fn(),
    state: fakeState,
    toggleCurrentFbosOnly: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<LogsFilterMenu {...fakeProps()} />);
    logTypes.filter(x => x !== "assertion").map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string.toLowerCase()));
    NON_FILTER_SETTINGS.map(string =>
      expect(container.textContent?.toLowerCase()).not.toContain(string));
  });

  it("renders new types", () => {
    const p = fakeProps();
    const { container } = render(<LogsFilterMenu {...p} />);
    logTypes.map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string.toLowerCase()));
    NON_FILTER_SETTINGS.map(string =>
      expect(container.textContent?.toLowerCase()).not.toContain(string));
  });

  it("renders setting on", () => {
    const p = fakeProps();
    p.state.currentFbosOnly = true;
    const { container } = render(<LogsFilterMenu {...p} />);
    expect(container.querySelector(".fb-toggle-button")?.className)
      .toContain("green");
  });

  it("bulk toggles filter levels", () => {
    const setFilterLevel = jest.fn();
    const p = fakeProps();
    p.setFilterLevel = (x) => (v) => setFilterLevel(x, v);
    const { container } = render(<LogsFilterMenu {...p} />);
    fireEvent.click(container.querySelectorAll(".mock-slider")[0]);
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType, 2));
  });
});
