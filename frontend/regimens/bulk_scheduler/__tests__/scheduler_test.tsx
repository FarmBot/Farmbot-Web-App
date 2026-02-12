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
    expect(container.textContent?.toLowerCase()).toContain("schedule");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const { container } = render(<DesignerRegimenScheduler {...p} />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.regimens());
  });

  it("commits bulk editor", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.sequences = [fakeSequence()];
    const { container } = render(<DesignerRegimenScheduler {...p} />);
    fireEvent.click(container.querySelector(".bulk-scheduler-add") as Element);
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
