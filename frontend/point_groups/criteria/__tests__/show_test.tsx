/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  EqCriteriaSelection,
  NumberCriteriaSelection,
  DaySelection,
  LocationSelection,
  NumberLtGtInput,
} from "..";
import {
  EqCriteriaSelectionProps,
  NumberCriteriaProps,
  DEFAULT_CRITERIA,
  LocationSelectionProps,
  NumberLtGtInputProps,
  DaySelectionProps,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import * as criteriaEdit from "../edit";
import * as ui from "../../../ui";

let removeEqCriteriaValueSpy: jest.SpyInstance;
let clearCriteriaFieldSpy: jest.SpyInstance;
let editCriteriaSpy: jest.SpyInstance;
let editGtLtCriteriaFieldSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  removeEqCriteriaValueSpy = jest.spyOn(criteriaEdit, "removeEqCriteriaValue")
    .mockImplementation(jest.fn());
  clearCriteriaFieldSpy = jest.spyOn(criteriaEdit, "clearCriteriaField")
    .mockImplementation(jest.fn());
  editCriteriaSpy = jest.spyOn(criteriaEdit, "editCriteria")
    .mockImplementation(jest.fn());
  editGtLtCriteriaFieldSpy = jest.spyOn(criteriaEdit, "editGtLtCriteriaField")
    .mockImplementation(() => jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: any) => {
      const value = props.selectedItem ? String(props.selectedItem.value) : "";
      return <select
        className={"mock-fb-select"}
        value={value}
        onChange={e => {
          const nextValue = e.currentTarget.value;
          const selected = nextValue === ""
            ? props.list.find((item: any) => item.isNull)
            || props.list.find((item: any) => String(item.value) === "")
            : props.list.find((item: any) =>
              String(item.value) === nextValue);
          props.onChange(selected || { label: "", value: nextValue });
        }}>
        <option value={""} />
        {props.list.map((item: any, index: number) =>
          <option key={`${item.value}-${index}`} value={String(item.value)}>
            {item.label}
          </option>)}
      </select>;
    });
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<EqCriteriaSelection<string> />", () => {
  const fakeProps = (): EqCriteriaSelectionProps<string> => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    type: "string",
    eqCriteria: {},
    criteriaKey: "string_eq",
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<EqCriteriaSelection<string> {...p} />);
    expect(container.textContent).toContain("=");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.eqCriteria = { openfarm_slug: ["slug"] };
    const { container } = render(<EqCriteriaSelection<string> {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(removeEqCriteriaValueSpy).toHaveBeenCalledWith(
      p.group,
      { openfarm_slug: ["slug"] },
      "string_eq",
      "openfarm_slug",
      "slug",
    );
  });
});

describe("<NumberCriteriaSelection />", () => {
  const fakeProps = (): NumberCriteriaProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    criteriaKey: "number_lt",
  });

  it("renders", () => {
    const p = fakeProps();
    p.criteria.number_lt = { x: 1 };
    const { container } = render(<NumberCriteriaSelection {...p} />);
    expect(container.textContent).toContain("<");
  });

  it("removes criteria", () => {
    const p = fakeProps();
    p.criteriaKey = "number_gt";
    p.criteria.number_gt = { x: 1 };
    const { container } = render(<NumberCriteriaSelection {...p} />);
    expect(container.textContent).toContain(">");
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(clearCriteriaFieldSpy).toHaveBeenCalledWith(
      p.group,
      ["number_gt"],
      ["x"],
    );
  });
});

describe("<DaySelection />", () => {
  const fakeProps = (): DaySelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    dayChanged: true,
    changeDay: jest.fn(),
    advanced: false,
  });

  it("shows label", () => {
    const p = fakeProps();
    p.advanced = true;
    const { container } = render(<DaySelection {...p} />);
    expect(container.querySelector("label")).toBeTruthy();
  });

  it("changes operator", () => {
    const p = fakeProps();
    const { container } = render(<DaySelection {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element, {
      target: { value: "<" }
    });
    expect(editCriteriaSpy).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 0, op: "<" } },
    );
  });

  it("changes day value", () => {
    const p = fakeProps();
    const { container } = render(<DaySelection {...p} />);
    fireEvent.change(container.querySelector("input[name='days_ago']") as Element, {
      target: { value: "1" }
    });
    expect(editCriteriaSpy).toHaveBeenCalledWith(
      p.group,
      { day: { days_ago: 1, op: "<" } },
    );
  });

  it("resets day criteria to default", () => {
    const p = fakeProps();
    p.group.body.criteria.day = { op: ">", days_ago: 1 };
    const { container } = render(<DaySelection {...p} />);
    fireEvent.click(container.querySelector("input[type='checkbox']") as Element);
    expect(editCriteriaSpy).toHaveBeenCalledWith(p.group, {
      day: { op: "<", days_ago: 0 }
    });
  });
});

describe("<NumberLtGtInput />", () => {
  const fakeProps = (): NumberLtGtInputProps => ({
    criteriaKey: "x",
    group: fakePointGroup(),
    dispatch: jest.fn(),
  });

  it("changes number_gt", () => {
    const p = fakeProps();
    const { container } = render(<NumberLtGtInput {...p} />);
    fireEvent.blur(container.querySelectorAll("input")[0] as Element, {
      target: { value: "1" }
    });
    expect(editGtLtCriteriaFieldSpy).toHaveBeenCalledWith(
      p.group,
      "number_gt",
      "x",
    );
  });

  it("changes number_lt", () => {
    const p = fakeProps();
    const { container } = render(<NumberLtGtInput {...p} />);
    fireEvent.blur(container.querySelectorAll("input")[1] as Element, {
      target: { value: "1" }
    });
    expect(editGtLtCriteriaFieldSpy).toHaveBeenCalledWith(
      p.group,
      "number_lt",
      "x",
    );
  });
});

describe("<LocationSelection />", () => {
  const fakeProps = (): LocationSelectionProps => ({
    criteria: DEFAULT_CRITERIA,
    group: fakePointGroup(),
    dispatch: jest.fn(),
    editGroupAreaInMap: false,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
  });

  it("clears location criteria", () => {
    const p = fakeProps();
    const { container } = render(<LocationSelection {...p} />);
    fireEvent.click(container.querySelector("input[type='checkbox']") as Element);
    expect(clearCriteriaFieldSpy).toHaveBeenCalledWith(
      p.group,
      ["number_lt", "number_gt"],
      ["x", "y"],
    );
  });

  it("toggles selection box behavior", () => {
    const p = fakeProps();
    const { container } = render(<LocationSelection {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.EDIT_GROUP_AREA_IN_MAP,
      payload: true
    });
  });

  it("doesn't display selection warning", () => {
    const p = fakeProps();
    p.group.body.criteria.number_gt = {};
    p.group.body.criteria.number_gt = {};
    const { container } = render(<LocationSelection {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("invalid selection");
  });

  it("displays selection warning", () => {
    const p = fakeProps();
    p.group.body.criteria.number_lt = { x: 100 };
    p.group.body.criteria.number_gt = { x: 200 };
    const { container } = render(<LocationSelection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid selection");
  });
});
