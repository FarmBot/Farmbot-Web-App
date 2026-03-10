import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import {
  PathInfoBar, PathInfoBarProps, Paths, PathsProps,
} from "../paths";
import {
  fakePointGroup, fakePoint,
} from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as crud from "../../api/crud";
import { SORT_OPTIONS } from "../point_group_sort";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import { nn } from "../other_sort_methods";

/**
 *  p1 -- p2 --
 *  -- -- -- --
 *  -- -- -- --
 *  p3 -- -- p4
 */
const pathTestCases = () => {
  const p1 = fakePoint();
  p1.body.x = 0;
  p1.body.y = 0;
  const p2 = fakePoint();
  p2.body.x = 2;
  p2.body.y = 0;
  const p3 = fakePoint();
  p3.body.x = 0;
  p3.body.y = 3;
  const p4 = fakePoint();
  p4.body.x = 3;
  p4.body.y = 3;
  return {
    points: { p1, p2, p3, p4 },
    order: {
      xy_ascending: [p1, p3, p2, p4],
      xy_descending: [p4, p2, p3, p1],
      yx_ascending: [p1, p2, p3, p4],
      yx_descending: [p4, p3, p2, p1],
      xy_alternating: [p1, p3, p2, p4],
      yx_alternating: [p1, p3, p2, p4],
      random: expect.arrayContaining([p1, p2, p3, p4]),
      nn: [p1, p2, p4, p3],
    },
    distance: {
      xy_ascending: 10,
      xy_descending: 10,
      yx_ascending: 9,
      yx_descending: 9,
      xy_alternating: 10,
      yx_alternating: 8,
      random: expect.any(Number),
      nn: 8,
    }
  };
};

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
});

describe("<PathInfoBar />", () => {
  const fakeProps = (): PathInfoBarProps => ({
    sortTypeKey: "random",
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pathData: { random: 123 },
  });

  it("hovers path", () => {
    const p = fakeProps();
    const { container } = render(<PathInfoBar {...p} />);
    fireEvent.mouseEnter(container.querySelector(".sort-option-bar") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: "random"
    });
  });

  it("unhovers path", () => {
    const p = fakeProps();
    const { container } = render(<PathInfoBar {...p} />);
    fireEvent.mouseLeave(container.querySelector(".sort-option-bar") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: undefined
    });
  });

  it("selects path", () => {
    const p = fakeProps();
    const { container } = render(<PathInfoBar {...p} />);
    fireEvent.click(container.querySelector(".sort-option-bar") as Element);
    expect(crud.edit).toHaveBeenCalledWith(p.group, { sort_type: "random" });
  });
});

describe("nearest neighbor algorithm", () => {
  it("returns optimized array", () => {
    const cases = pathTestCases();
    const { p1, p2, p3, p4 } = cases.points;
    const pathPoints = nn([p4, p2, p3, p1, p1]);
    expect(pathPoints).toEqual(cases.order.nn);
  });
});

describe("<Paths />", () => {
  const fakeProps = (): PathsProps => ({
    pathPoints: [],
    dispatch: jest.fn(),
    group: fakePointGroup(),
  });

  const renderPaths = (props: PathsProps) => {
    const ref = React.createRef<Paths>();
    const view = render(<Paths ref={ref} {...props} />);
    return { ref, ...view };
  };

  it("generates path data", async () => {
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    const { ref } = renderPaths(p);
    await waitFor(() => expect(ref.current?.state.pathData).toEqual(cases.distance));
    expect(screen.getByText(/optimized/i)).toBeInTheDocument();
  });

  it.each<[PointGroupSortType]>([
    ["xy_ascending"],
    ["xy_descending"],
    ["yx_ascending"],
    ["yx_descending"],
    ["random"],
  ])("checks sort order: %s", (sortType) => {
    const cases = pathTestCases();
    expect(SORT_OPTIONS[sortType](cases.order.xy_ascending))
      .toEqual(cases.order[sortType]);
  });

  it("renders new sort type", () => {
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    renderPaths(p);
    expect(screen.getByText(/optimized/i)).toBeInTheDocument();
  });

  it("doesn't generate data twice", async () => {
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    const { ref } = renderPaths(p);
    await waitFor(() => expect(ref.current?.state.pathData).toEqual(cases.distance));
    act(() => {
      ref.current?.setState({ pathData: { nn: 0 } });
    });
    expect(ref.current?.state.pathData).toEqual({ nn: 0 });
  });
});
