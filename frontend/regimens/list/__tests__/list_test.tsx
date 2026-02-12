import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import {
  mapStateToProps,
  RawDesignerRegimenList as DesignerRegimenList,
} from "../list";
import { RegimensListProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import * as addRegimenModule from "../add_regimen";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { NavigationContext } from "../../../routes_helpers";

describe("<DesignerRegimenList />", () => {
  let addRegimenSpy: jest.SpyInstance;

  beforeEach(() => {
    addRegimenSpy = jest.spyOn(addRegimenModule, "addRegimen")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    addRegimenSpy.mockRestore();
  });

  const fakeProps = (): RegimensListProps => ({
    dispatch: jest.fn(),
    regimens: [],
    regimenUsageStats: {},
  });

  it("renders empty", () => {
    const { container } = render(<DesignerRegimenList {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("regimen");
    expect(container.textContent?.toLowerCase()).not.toContain("foo");
  });

  it("renders", () => {
    const p = fakeProps();
    const regimen = fakeRegimen();
    regimen.body.name = "foo";
    p.regimens = [regimen];
    const { container } = render(<DesignerRegimenList {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("foo");
    expect(container.textContent?.toLowerCase()).not.toContain("regimen");
  });

  it("sets search term", () => {
    const ref = React.createRef<DesignerRegimenList>();
    const { container } = render(
      <DesignerRegimenList ref={ref} {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "term" },
      currentTarget: { value: "term" },
    });
    expect(ref.current?.state.searchTerm).toEqual("term");
  });

  it("filters regimens", () => {
    const p = fakeProps();
    const regimen1 = fakeRegimen();
    regimen1.body.name = "foo";
    const regimen2 = fakeRegimen();
    regimen2.body.name = "bar";
    p.regimens = [regimen1, regimen2];
    const ref = React.createRef<DesignerRegimenList>();
    const { container } = render(<DesignerRegimenList ref={ref} {...p} />);
    act(() => {
      ref.current?.setState({ searchTerm: "foo" });
    });
    expect(container.textContent?.toLowerCase()).toContain("foo");
    expect(container.textContent?.toLowerCase()).not.toContain("bar");
  });

  it("adds new regimen", () => {
    const p = fakeProps();
    p.regimens = [fakeRegimen(), fakeRegimen()];
    const ref = React.createRef<DesignerRegimenList>();
    const { container } = render(
      <NavigationContext.Provider value={jest.fn()}>
        <DesignerRegimenList ref={ref} {...p} />
      </NavigationContext.Provider>);
    fireEvent.click(container.querySelector(".panel-top .fb-button") as Element);
    expect(addRegimenModule.addRegimen).toHaveBeenCalledWith(
      2, ref.current?.navigate);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToProps(state);
    expect(props.regimens).toEqual([]);
  });
});
