import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { CheckboxListProps, SubCriteriaSectionProps } from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { CheckboxList, SubCriteriaSection } from "../subcriteria";
import * as criteriaEdit from "../edit";

let toggleAndEditEqCriteriaSpy: jest.SpyInstance;

beforeEach(() => {
  toggleAndEditEqCriteriaSpy = jest.spyOn(criteriaEdit, "toggleAndEditEqCriteria")
    .mockImplementation(jest.fn());
});


describe("<SubCriteriaSection />", () => {
  const fakeProps = (): SubCriteriaSectionProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    disabled: false,
    pointerTypes: [],
    slugs: [],
  });

  it("doesn't return criteria", () => {
    const p = fakeProps();
    p.pointerTypes = [];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent).toEqual("");
  });

  it("doesn't return incompatible criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Plant", "Weed"];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent).toEqual("");
  });

  it("returns plant criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Plant"];
    p.slugs = ["strawberry-guava"];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("stage");
    expect(container.textContent).toContain("Strawberry guava");
  });

  it("returns point criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["GenericPointer"];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("color");
  });

  it("returns weed criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["Weed"];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("source");
  });

  it("returns tool slot criteria", () => {
    const p = fakeProps();
    p.pointerTypes = ["ToolSlot"];
    const { container } = render(<SubCriteriaSection {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("direction");
  });
});

describe("<CheckboxList />", () => {
  const fakeProps = (): CheckboxListProps<string> => ({
    criteriaKey: "openfarm_slug",
    list: [{ label: "label", value: "value" }],
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pointerType: "Plant",
    disabled: false,
  });

  it("toggles criteria", () => {
    const p = fakeProps();
    const { container } = render(<CheckboxList {...p} />);
    expect(container.textContent).toContain("label");
    fireEvent.click(container.querySelector("input") as Element);
    expect(toggleAndEditEqCriteriaSpy).toHaveBeenCalledWith(
      p.group, "openfarm_slug", "value");
  });
});
