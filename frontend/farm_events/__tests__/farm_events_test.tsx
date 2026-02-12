import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { RawFarmEvents as FarmEvents } from "../farm_events";
import {
  calendarRows,
} from "../../__test_support__/farm_event_calendar_support";
import { defensiveClone } from "../../util";
import { FarmEventProps } from "../../farm_designer/interfaces";
import { Path } from "../../internal_urls";

const originalDocumentQuerySelector = document.querySelector.bind(document);
const originalPathname = location.pathname;
let farmEventsPathSpy: jest.SpyInstance;

beforeEach(() => {
  location.pathname = Path.mock(Path.farmEvents());
  farmEventsPathSpy = jest.spyOn(Path, "farmEvents")
    .mockImplementation((path?: string | number) =>
      Path.designer("events") + (path ? `/${path}` : ""));
});

afterEach(() => {
  farmEventsPathSpy?.mockRestore();
  Object.defineProperty(document, "querySelector", {
    value: originalDocumentQuerySelector,
    configurable: true,
  });
  location.pathname = originalPathname;
});

describe("<FarmEvents />", () => {
  const fakeProps = (): FarmEventProps => ({
    timezoneIsSet: true,
    calendarRows,
  });

  it("sorts items correctly", () => {
    const { container } = render(<FarmEvents {...fakeProps()} />);
    const times = Array.from(container.querySelectorAll(".farm-event-data-time"))
      .map(x => x.textContent?.trim() || "");
    expect(times).not.toContain("");
    expect(times.length).toEqual(21);
    expect(times[0]).toEqual("12:05pm");
    expect(times[2]).toEqual("02:00pm");
  });

  it("renders sequence FarmEvent lacking a subheading", () => {
    const p = fakeProps();
    const row = [defensiveClone(calendarRows[0])];
    row[0].items = [{
      mmddyy: "072417",
      sortKey: 1500915900,
      timeStr: "12:05pm",
      heading: "Every 4 hours",
      executableId: 25,
      executableType: "Sequence",
      subheading: "",
      variables: ["variable 1", "variable 2"],
      id: 79,
      color: "gray",
    }];
    p.calendarRows = row;
    const { container } = render(<FarmEvents {...p} />);
    expect(container.textContent).toContain("Every 4 hours");
    const item = container.querySelector(".farm-event-data-block") as Element;
    expect(item.classList.contains("gray")).toBeTruthy();
    expect(item.querySelectorAll(".farm-event-variable").length).toEqual(2);
    expect((item.querySelector("a") as HTMLAnchorElement).getAttribute("href"))
      .toEqual(Path.sequences("Every_4_hours"));
  });

  it("renders regimen FarmEvent lacking a subheading", () => {
    const p = fakeProps();
    const row = [defensiveClone(calendarRows[0])];
    row[0].items = [{
      mmddyy: "072417",
      sortKey: 1500915900,
      timeStr: "12:05pm",
      heading: "Every 4 hours",
      executableId: 25,
      executableType: "Regimen",
      subheading: "",
      variables: ["variable 1", "variable 2"],
      id: 79,
      color: "gray",
    }];
    p.calendarRows = row;
    const { container } = render(<FarmEvents {...p} />);
    expect(container.textContent).toContain("Every 4 hours");
    const item = container.querySelector(".farm-event-data-block") as Element;
    expect(item.classList.contains("gray")).toBeTruthy();
    expect(item.querySelectorAll(".farm-event-variable").length).toEqual(2);
    expect((item.querySelector("a") as HTMLAnchorElement).getAttribute("href"))
      .toEqual(Path.regimens("Every_4_hours"));
  });

  it("filters farm events: finds none", () => {
    const { container } = render(<FarmEvents {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "no match" },
      currentTarget: { value: "no match" },
    });
    expect(container.textContent?.toLowerCase()).not.toContain("every 4 hours");
  });

  it("filters farm events: finds some", () => {
    const { container } = render(<FarmEvents {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "every 4 hours" },
      currentTarget: { value: "every 4 hours" },
    });
    expect(container.textContent?.toLowerCase()).toContain("every 4 hours");
  });

  it("resets calendar", () => {
    const mockScrollTo = jest.fn();
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollTo: mockScrollTo }), configurable: true
    });
    const instance = new FarmEvents(fakeProps());
    instance.setState = ((state, callback) => {
      const update = typeof state == "function"
        ? state(instance.state, instance.props)
        : state;
      instance.state = { ...instance.state, ...update };
      callback?.();
    }) as FarmEvents["setState"];
    instance.setState({ searchTerm: "farm events" });
    instance.resetCalendar();
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    expect(instance.state.searchTerm).toEqual("");
  });

  it("can't find panel", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => { }, configurable: true
    });
    const instance = new FarmEvents(fakeProps());
    instance.setState = ((state, callback) => {
      const update = typeof state == "function"
        ? state(instance.state, instance.props)
        : state;
      instance.state = { ...instance.state, ...update };
      callback?.();
    }) as FarmEvents["setState"];
    instance.setState({ searchTerm: "farm events" });
    instance.resetCalendar();
    expect(instance.state.searchTerm).toEqual("");
  });

  it("has add new farm event link", () => {
    render(<FarmEvents {...fakeProps()} />);
    expect(farmEventsPathSpy.mock.calls).toContainEqual(["add"]);
  });
});
