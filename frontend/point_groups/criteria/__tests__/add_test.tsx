import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { AddEqCriteria, AddNumberCriteria } from "..";
import {
  AddEqCriteriaProps, NumberCriteriaProps, DEFAULT_CRITERIA,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import * as criteriaEdit from "../edit";

let editCriteriaSpy: jest.SpyInstance;

beforeEach(() => {
  editCriteriaSpy = jest.spyOn(criteriaEdit, "editCriteria")
    .mockImplementation(jest.fn());
});


describe("<AddEqCriteria<string> />", () => {
  const fakeProps = (): AddEqCriteriaProps<string> => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    type: "string",
    eqCriteria: {},
    criteriaKey: "string_eq",
  });

  it("renders string_eq add", () => {
    const { container } = render(<AddEqCriteria<string> {...fakeProps()} />);
    expect(container.textContent).toContain("=");
  });

  it("changes field", () => {
    const { container } = render(<AddEqCriteria<string> {...fakeProps()} />);
    const fieldInput = container.querySelectorAll("input")[0];
    fireEvent.change(fieldInput, { target: { value: "openfarm_slug" } });
    expect(fieldInput.value).toEqual("openfarm_slug");
  });

  it("changes value", () => {
    const { container } = render(<AddEqCriteria<string> {...fakeProps()} />);
    const valueInput = container.querySelectorAll("input")[1];
    fireEvent.change(valueInput, { target: { value: "slug" } });
    expect(valueInput.value).toEqual("slug");
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const addRef = React.createRef<AddEqCriteria<string>>();
    const { container } = render(<AddEqCriteria<string> ref={addRef} {...p} />);
    act(() => {
      addRef.current?.setState({ key: "openfarm_slug", value: "slug" });
    });
    fireEvent.click(container.querySelector("button") as Element);
    expect(editCriteriaSpy).toHaveBeenCalledWith(p.group, {
      string_eq: { openfarm_slug: ["slug"] }
    });
  });
});

describe("<AddEqCriteria<number> />", () => {
  const fakeProps = (): AddEqCriteriaProps<number> => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    type: "number",
    eqCriteria: {},
    criteriaKey: "number_eq",
  });

  it("renders number_eq add", () => {
    const { container } = render(<AddEqCriteria<number> {...fakeProps()} />);
    expect(container.textContent).toContain("=");
  });

  it("changes field", () => {
    const { container } = render(<AddEqCriteria<number> {...fakeProps()} />);
    const fieldInput = container.querySelectorAll("input")[0];
    fireEvent.change(fieldInput, { target: { value: "x" } });
    expect(fieldInput.value).toEqual("x");
  });

  it("changes value", () => {
    const { container } = render(<AddEqCriteria<number> {...fakeProps()} />);
    const valueInput = container.querySelectorAll("input")[1];
    fireEvent.change(valueInput, { target: { value: "1" } });
    expect(valueInput.value).toEqual("1");
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const addRef = React.createRef<AddEqCriteria<number>>();
    const { container } = render(<AddEqCriteria<number> ref={addRef} {...p} />);
    act(() => {
      addRef.current?.setState({ key: "x", value: 1 as unknown as string });
    });
    fireEvent.click(container.querySelector("button") as Element);
    expect(editCriteriaSpy).toHaveBeenCalledWith(p.group, {
      number_eq: { x: [1] }
    });
  });
});

describe("<AddNumberCriteria />", () => {
  const fakeProps = (): NumberCriteriaProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    criteriaKey: "number_lt",
    criteria: DEFAULT_CRITERIA,
  });

  it("renders", () => {
    const { container } = render(<AddNumberCriteria {...fakeProps()} />);
    expect(container.textContent).toContain("<");
  });

  it("changes field", () => {
    const { container } = render(<AddNumberCriteria {...fakeProps()} />);
    const fieldInput = container.querySelectorAll("input")[0];
    fireEvent.change(fieldInput, { target: { value: "x" } });
    expect(fieldInput.value).toEqual("x");
  });

  it("changes value", () => {
    const { container } = render(<AddNumberCriteria {...fakeProps()} />);
    const valueInput = container.querySelectorAll("input")[1];
    fireEvent.change(valueInput, { target: { value: "1" } });
    expect(valueInput.value).toEqual("1");
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const addRef = React.createRef<AddNumberCriteria>();
    const { container } = render(<AddNumberCriteria ref={addRef} {...p} />);
    act(() => {
      addRef.current?.setState({ key: "x", value: 1 });
    });
    fireEvent.click(container.querySelector("button") as Element);
    expect(editCriteriaSpy).toHaveBeenCalledWith(p.group, { number_lt: { x: 1 } });
  });
});
