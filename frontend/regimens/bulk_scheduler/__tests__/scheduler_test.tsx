import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  mapStateToProps,
  RawDesignerRegimenScheduler as DesignerRegimenScheduler,
} from "../scheduler";
import {
  fakeRegimen, fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { RegimenSchedulerProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import { Path } from "../../../internal_urls";
import { DesignerPanelHeader } from "../../../farm_designer/designer_panel";

const findByType = (
  node: React.ReactNode,
  type: unknown,
): React.ReactElement<{
  children?: React.ReactNode;
  backTo?: string;
}> | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of React.Children.toArray(node)) {
      const found = findByType(child, type);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement(node)) {
    if (node.type === type) {
      return node as React.ReactElement<{
        children?: React.ReactNode;
        backTo?: string;
      }>;
    }
    return findByType(
      (node.props as { children?: React.ReactNode }).children, type);
  }
  return undefined;
};

describe("<DesignerRegimenScheduler />", () => {
  const fakeProps = (): RegimenSchedulerProps => ({
    dispatch: jest.fn(),
    sequences: [],
    resources: buildResourceIndex([fakeDevice()]).index,
    current: fakeRegimen(),
    selectedSequence: undefined,
    dailyOffsetMs: 1000,
    weeks: [],
    device: fakeDevice(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.current = fakeRegimen();
    const { container } = render(<DesignerRegimenScheduler {...p} />);
    const text = (container.textContent || "").toLowerCase();
    expect(container.querySelector(".bulk-scheduler")).toBeTruthy();
    expect(text).toContain("sequence");
    expect(text).toContain("days");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const element = new DesignerRegimenScheduler(p).render();
    const header = findByType(element, DesignerPanelHeader);
    expect(header?.props.backTo).toEqual(Path.regimens());
  });

  it("commits bulk editor", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.sequences = [fakeSequence()];
    const { container } = render(<DesignerRegimenScheduler {...p} />);
    const addButton = container.querySelector(".bulk-scheduler-add")
      || container.querySelector("button.fb-button.green");
    expect(addButton).toBeTruthy();
    addButton && fireEvent.click(addButton);
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.sequences).toEqual([]);
  });
});
