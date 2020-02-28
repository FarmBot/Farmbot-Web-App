jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

let mockDev = false;
jest.mock("../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  PathInfoBar, nn, NNPath, PathInfoBarProps, Paths, PathsProps,
} from "../paths";
import {
  fakePointGroup, fakePoint,
} from "../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import { Actions } from "../../../constants";
import { edit } from "../../../api/crud";
import { error } from "../../../toast/toast";
import { svgMount } from "../../../__test_support__/svg_mount";
import { SORT_OPTIONS } from "../point_group_sort";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

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
      random: expect.arrayContaining([p1, p2, p3, p4]),
      nn: [p1, p2, p4, p3],
    },
    distance: {
      xy_ascending: 10,
      xy_descending: 10,
      yx_ascending: 9,
      yx_descending: 9,
      random: expect.any(Number),
      nn: 8,
    }
  };
};

describe("<PathInfoBar />", () => {
  const fakeProps = (): PathInfoBarProps => ({
    sortTypeKey: "random",
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pathData: { random: 123 },
  });

  it("hovers path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: "random"
    });
  });

  it("unhovers path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: undefined
    });
  });

  it("selects path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("click");
    expect(edit).toHaveBeenCalledWith(p.group, { sort_type: "random" });
  });

  it("selects new path", () => {
    const p = fakeProps();
    p.sortTypeKey = "nn";
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("click");
    expect(edit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Not supported yet.");
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

describe("<NNPath />", () => {
  const fakeProps = () => ({
    pathPoints: [],
    mapTransformProps: fakeMapTransformProps(),
  });

  it("doesn't render optimized path", () => {
    const wrapper = svgMount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<svg><g></g></svg>");
  });

  it("renders optimized path", () => {
    localStorage.setItem("try_it", "ok");
    const wrapper = svgMount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).not.toEqual("<svg><g></g></svg>");
  });
});

describe("<Paths />", () => {
  const fakeProps = (): PathsProps => ({
    pathPoints: [],
    dispatch: jest.fn(),
    group: fakePointGroup(),
  });

  it("generates path data", () => {
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    const wrapper = mount<Paths>(<Paths {...p} />);
    expect(wrapper.state().pathData).toEqual(cases.distance);
    expect(wrapper.text().toLowerCase()).not.toContain("optimized");
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
    mockDev = true;
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    const wrapper = mount<Paths>(<Paths {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("optimized");
  });

  it("doesn't generate data twice", () => {
    const p = fakeProps();
    const cases = pathTestCases();
    p.pathPoints = cases.order.xy_ascending;
    const wrapper = mount<Paths>(<Paths {...p} />);
    expect(wrapper.state().pathData).toEqual(cases.distance);
    wrapper.setState({ pathData: { nn: 0 } });
    wrapper.update();
    expect(wrapper.state().pathData).toEqual({ nn: 0 });
  });
});
